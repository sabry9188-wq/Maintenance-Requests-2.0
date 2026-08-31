-- ============================================================================
-- Maintenance Requests 2.0 - Functions & Triggers
-- Run this SECOND, after schema.sql. See SETUP.md for full order.
-- ============================================================================

-- ============================================================================
-- 1. New auth user -> profiles row
-- ============================================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_station_id uuid;
  v_department_id uuid;
begin
  -- Self-registration lets a user pick their own station/department at
  -- sign-up (sent as auth metadata); Admin can still correct it later from
  -- the Users page. Role is never taken from metadata - always STATION_USER.
  begin
    v_station_id := nullif(new.raw_user_meta_data->>'station_id', '')::uuid;
  exception when others then
    v_station_id := null;
  end;

  begin
    v_department_id := nullif(new.raw_user_meta_data->>'department_id', '')::uuid;
  exception when others then
    v_department_id := null;
  end;

  insert into public.profiles (id, full_name, email, role, station_id, department_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'STATION_USER',
    v_station_id,
    v_department_id
  );
  return new;
end;
$$;

drop trigger if exists trg_handle_new_user on auth.users;
create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- 2. Automatic, DB-guaranteed request number: MR-YY-NNNNNN
-- ============================================================================

create or replace function generate_request_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  yy text := to_char(now(), 'YY');
  next_val bigint;
begin
  insert into request_number_counters (year_yy, last_value)
  values (yy, 1)
  on conflict (year_yy)
  do update set last_value = request_number_counters.last_value + 1
  returning last_value into next_val;

  return 'MR-' || yy || '-' || lpad(next_val::text, 6, '0');
end;
$$;

create or replace function trg_set_request_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.request_number is null then
    new.request_number := generate_request_number();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_before_insert_request_number on maintenance_requests;
create trigger trg_before_insert_request_number
  before insert on maintenance_requests
  for each row execute function trg_set_request_number();

-- ============================================================================
-- 3. Status-transition validation (DB is the source of truth)
-- ============================================================================

create or replace function validate_status_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role user_role;
  transition_exists boolean;
  role_allowed boolean;
begin
  if new.status = old.status then
    return new;
  end if;

  select role into caller_role from profiles where id = auth.uid();

  select true into transition_exists
  from request_status_transitions
  where from_status = old.status and to_status = new.status;

  if transition_exists is not true then
    raise exception 'INVALID_STATUS_TRANSITION: % -> % is not allowed', old.status, new.status
      using errcode = 'P0001';
  end if;

  -- Admin can always move a request along any allowed transition regardless of
  -- the allowed_roles list (support/override use case).
  if caller_role is not null and caller_role <> 'ADMIN' then
    select (caller_role = any(allowed_roles)) into role_allowed
    from request_status_transitions
    where from_status = old.status and to_status = new.status;

    if role_allowed is not true then
      raise exception 'STATUS_TRANSITION_NOT_ALLOWED_FOR_ROLE: % cannot move % -> %',
        caller_role, old.status, new.status
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_status_transition on maintenance_requests;
create trigger trg_validate_status_transition
  before update of status on maintenance_requests
  for each row execute function validate_status_transition();

-- ============================================================================
-- 4. Auto timeline (history) + audit log on status change
-- ============================================================================

create or replace function log_request_submitted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into maintenance_request_history (request_id, actor_id, action, new_status, comment)
  values (new.id, new.requested_by, 'SUBMITTED', new.status, 'Request submitted');

  insert into audit_logs (user_id, action, table_name, record_id, request_number, new_status, comment)
  values (new.requested_by, 'REQUEST_CREATED', 'maintenance_requests', new.id, new.request_number, new.status, 'Request submitted');

  return new;
end;
$$;

drop trigger if exists trg_log_request_submitted on maintenance_requests;
create trigger trg_log_request_submitted
  after insert on maintenance_requests
  for each row execute function log_request_submitted();

create or replace function log_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into maintenance_request_history (request_id, actor_id, action, old_status, new_status, comment)
    values (new.id, auth.uid(), 'STATUS_CHANGED', old.status, new.status, null);

    insert into audit_logs (user_id, action, table_name, record_id, request_number, old_status, new_status)
    values (auth.uid(), 'STATUS_CHANGE', 'maintenance_requests', new.id, new.request_number, old.status::text, new.status::text);
  end if;

  if new.assigned_technician_id is distinct from old.assigned_technician_id then
    insert into maintenance_request_history (request_id, actor_id, action, comment)
    values (
      new.id,
      auth.uid(),
      'ASSIGNED',
      case
        when new.assigned_technician_id is null then 'Technician unassigned'
        else 'Technician assigned: ' || (select full_name from profiles where id = new.assigned_technician_id)
      end
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_log_status_change on maintenance_requests;
create trigger trg_log_status_change
  after update on maintenance_requests
  for each row execute function log_status_change();

-- ============================================================================
-- 5. Notification helper (called from server actions via RPC)
-- ============================================================================

create or replace function create_notification(
  p_recipient_id uuid,
  p_request_id uuid,
  p_type notification_type,
  p_title text,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into notifications (recipient_id, request_id, type, title, body)
  values (p_recipient_id, p_request_id, p_type, p_title, p_body)
  returning id into new_id;

  return new_id;
end;
$$;

-- Notify every active user in a department - used when work is completed, so
-- anyone in the requesting department (not just the original requester) sees
-- the completion report and can confirm/reopen the request.
create or replace function notify_department(
  p_department_id uuid,
  p_request_id uuid,
  p_type notification_type,
  p_title text,
  p_body text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into notifications (recipient_id, request_id, type, title, body)
  select id, p_request_id, p_type, p_title, p_body
  from profiles
  where department_id = p_department_id and is_active = true;
end;
$$;

-- Notify every active Engineering user (ENGINEERING_MANAGER, ENGINEER) - used on submit.
create or replace function notify_engineering_team(
  p_request_id uuid,
  p_type notification_type,
  p_title text,
  p_body text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into notifications (recipient_id, request_id, type, title, body)
  select id, p_request_id, p_type, p_title, p_body
  from profiles
  where role in ('ENGINEERING_MANAGER', 'ENGINEER') and is_active = true;
end;
$$;

-- ============================================================================
-- 6. RLS helper functions (security definer to avoid recursive RLS on profiles)
-- ============================================================================

create or replace function current_profile()
returns profiles
language sql
stable
security definer
set search_path = public
as $$
  select * from profiles where id = auth.uid();
$$;

create or replace function current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from profiles where id = auth.uid()) = 'ADMIN', false);
$$;

create or replace function is_engineering()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from profiles where id = auth.uid()) in ('ENGINEERING_MANAGER', 'ENGINEER'), false);
$$;

create or replace function is_engineering_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from profiles where id = auth.uid()) = 'ENGINEERING_MANAGER', false);
$$;

create or replace function is_management()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from profiles where id = auth.uid()) = 'MANAGEMENT_VIEW_ONLY', false);
$$;

create or replace function is_station_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from profiles where id = auth.uid()) = 'STATION_USER', false);
$$;

-- ============================================================================
-- 7. Prevent non-admins from self-escalating role/station/department on profiles
-- ============================================================================

create or replace function guard_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role user_role;
begin
  -- auth.uid() is null for service-role / SQL editor / migration & seed
  -- contexts (no end-user session) - those are already trusted, so only
  -- guard changes made from within an authenticated end-user request.
  if auth.uid() is null then
    return new;
  end if;

  select role into caller_role from profiles where id = auth.uid();

  if caller_role is distinct from 'ADMIN' then
    if new.role is distinct from old.role
      or new.station_id is distinct from old.station_id
      or new.department_id is distinct from old.department_id
      or new.is_active is distinct from old.is_active then
      raise exception 'ONLY_ADMIN_CAN_CHANGE_ROLE_OR_ASSIGNMENT' using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_profile_privileged_fields on profiles;
create trigger trg_guard_profile_privileged_fields
  before update on profiles
  for each row execute function guard_profile_privileged_fields();

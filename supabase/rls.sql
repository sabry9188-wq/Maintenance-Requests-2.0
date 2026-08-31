-- ============================================================================
-- Maintenance Requests 2.0 - Row Level Security
-- Run this THIRD, after schema.sql and functions.sql. See SETUP.md for order.
-- ============================================================================

-- ============================================================================
-- Enable RLS everywhere
-- ============================================================================

alter table stations enable row level security;
alter table departments enable row level security;
alter table areas enable row level security;
alter table maintenance_categories enable row level security;
alter table maintenance_problem_types enable row level security;
alter table assets enable row level security;
alter table sla_config enable row level security;
alter table request_status_transitions enable row level security;
alter table request_number_counters enable row level security;
alter table profiles enable row level security;
alter table maintenance_requests enable row level security;
alter table maintenance_request_attachments enable row level security;
alter table maintenance_request_updates enable row level security;
alter table maintenance_request_parts enable row level security;
alter table maintenance_request_history enable row level security;
alter table maintenance_assignments enable row level security;
alter table notifications enable row level security;
alter table feedback enable row level security;
alter table preventive_maintenance enable row level security;
alter table preventive_maintenance_tasks enable row level security;
alter table audit_logs enable row level security;

-- request_number_counters: no client policies at all - only touched by the
-- security definer generate_request_number() function, which bypasses RLS.

-- ============================================================================
-- Reference tables: readable by every authenticated user, writable by ADMIN
-- ============================================================================

-- stations/departments are readable by anon too (not just authenticated)
-- because the registration page needs to show a station/department picker
-- before the user has an active session.
create policy "reference_read_all" on stations for select to anon, authenticated using (true);
create policy "reference_write_admin" on stations for insert to authenticated with check (is_admin());
create policy "reference_update_admin" on stations for update to authenticated using (is_admin());
create policy "reference_delete_admin" on stations for delete to authenticated using (is_admin());

create policy "reference_read_all" on departments for select to anon, authenticated using (true);
create policy "reference_write_admin" on departments for insert to authenticated with check (is_admin());
create policy "reference_update_admin" on departments for update to authenticated using (is_admin());
create policy "reference_delete_admin" on departments for delete to authenticated using (is_admin());

create policy "reference_read_all" on areas for select to authenticated using (true);
create policy "reference_write_admin" on areas for insert to authenticated with check (is_admin());
create policy "reference_update_admin" on areas for update to authenticated using (is_admin());
create policy "reference_delete_admin" on areas for delete to authenticated using (is_admin());

create policy "reference_read_all" on maintenance_categories for select to authenticated using (true);
create policy "reference_write_admin" on maintenance_categories for insert to authenticated with check (is_admin());
create policy "reference_update_admin" on maintenance_categories for update to authenticated using (is_admin());
create policy "reference_delete_admin" on maintenance_categories for delete to authenticated using (is_admin());

create policy "reference_read_all" on maintenance_problem_types for select to authenticated using (true);
create policy "reference_write_admin" on maintenance_problem_types for insert to authenticated with check (is_admin());
create policy "reference_update_admin" on maintenance_problem_types for update to authenticated using (is_admin());
create policy "reference_delete_admin" on maintenance_problem_types for delete to authenticated using (is_admin());

create policy "reference_read_all" on sla_config for select to authenticated using (true);
create policy "reference_write_admin" on sla_config for insert to authenticated with check (is_admin());
create policy "reference_update_admin" on sla_config for update to authenticated using (is_admin());

create policy "reference_read_all" on request_status_transitions for select to authenticated using (true);
create policy "reference_write_admin" on request_status_transitions for insert to authenticated with check (is_admin());
create policy "reference_update_admin" on request_status_transitions for update to authenticated using (is_admin());
create policy "reference_delete_admin" on request_status_transitions for delete to authenticated using (is_admin());

-- Assets: readable by everyone authenticated, writable by Admin + Engineering Manager
create policy "assets_read_all" on assets for select to authenticated using (true);
create policy "assets_write_admin_eng" on assets for insert to authenticated
  with check (is_admin() or is_engineering_manager());
create policy "assets_update_admin_eng" on assets for update to authenticated
  using (is_admin() or is_engineering_manager());
create policy "assets_delete_admin" on assets for delete to authenticated using (is_admin());

-- ============================================================================
-- profiles
-- ============================================================================

create policy "profiles_select_self" on profiles for select to authenticated
  using (id = auth.uid());
create policy "profiles_select_staff" on profiles for select to authenticated
  using (is_admin() or is_engineering() or is_management());

create policy "profiles_update_self" on profiles for update to authenticated
  using (id = auth.uid());
create policy "profiles_update_admin" on profiles for update to authenticated
  using (is_admin());
-- Note: the trg_guard_profile_privileged_fields trigger (functions.sql) blocks
-- non-admins from changing role/station_id/department_id/is_active even though
-- profiles_update_self allows the row-level UPDATE for their own name/phone.

-- ============================================================================
-- maintenance_requests
-- ============================================================================

create policy "requests_select_staff" on maintenance_requests for select to authenticated
  using (is_admin() or is_engineering() or is_management());

create policy "requests_select_own_station" on maintenance_requests for select to authenticated
  using (
    is_station_user() and (
      requested_by = auth.uid()
      or station_id = (select station_id from profiles where id = auth.uid())
      or department_id = (select department_id from profiles where id = auth.uid())
    )
  );

create policy "requests_insert_creators" on maintenance_requests for insert to authenticated
  with check (
    requested_by = auth.uid()
    and (is_station_user() or is_engineering_manager() or is_admin())
  );

create policy "requests_update_engineering" on maintenance_requests for update to authenticated
  using (is_admin() or is_engineering_manager())
  with check (is_admin() or is_engineering_manager());

create policy "requests_update_assigned_technician" on maintenance_requests for update to authenticated
  using (
    (select role from profiles where id = auth.uid()) = 'ENGINEER'
    and assigned_technician_id = auth.uid()
  )
  with check (
    (select role from profiles where id = auth.uid()) = 'ENGINEER'
    and assigned_technician_id = auth.uid()
  );

create policy "requests_update_station_confirmation" on maintenance_requests for update to authenticated
  using (
    is_station_user()
    and status in ('PENDING_CONFIRMATION', 'COMPLETED')
    and (
      requested_by = auth.uid()
      or station_id = (select station_id from profiles where id = auth.uid())
      or department_id = (select department_id from profiles where id = auth.uid())
    )
  )
  with check (
    is_station_user()
    and status in ('CLOSED', 'REOPENED', 'PENDING_CONFIRMATION')
  );

-- No delete policy on maintenance_requests: full history is preserved by design.

-- ============================================================================
-- Child tables: visibility follows the parent request's visibility
-- ============================================================================

create policy "attachments_select_follows_request" on maintenance_request_attachments for select to authenticated
  using (
    exists (
      select 1 from maintenance_requests r
      where r.id = request_id
        and (
          is_admin() or is_engineering() or is_management()
          or (
            is_station_user() and (
              r.requested_by = auth.uid()
              or r.station_id = (select station_id from profiles where id = auth.uid())
              or r.department_id = (select department_id from profiles where id = auth.uid())
            )
          )
        )
    )
  );

create policy "attachments_insert_own_request" on maintenance_request_attachments for insert to authenticated
  with check (
    uploaded_by = auth.uid()
    and (
      is_admin() or is_engineering()
      or exists (
        select 1 from maintenance_requests r
        where r.id = request_id and r.requested_by = auth.uid()
      )
    )
  );

create policy "updates_select_follows_request" on maintenance_request_updates for select to authenticated
  using (
    exists (
      select 1 from maintenance_requests r
      where r.id = request_id
        and (
          is_admin() or is_engineering() or is_management()
          or (
            is_station_user() and (
              r.requested_by = auth.uid()
              or r.station_id = (select station_id from profiles where id = auth.uid())
              or r.department_id = (select department_id from profiles where id = auth.uid())
            )
          )
        )
    )
  );

create policy "updates_insert_engineering" on maintenance_request_updates for insert to authenticated
  with check (is_admin() or is_engineering());

create policy "parts_select_follows_request" on maintenance_request_parts for select to authenticated
  using (
    exists (
      select 1 from maintenance_requests r
      where r.id = request_id
        and (
          is_admin() or is_engineering() or is_management()
          or (
            is_station_user() and (
              r.requested_by = auth.uid()
              or r.station_id = (select station_id from profiles where id = auth.uid())
              or r.department_id = (select department_id from profiles where id = auth.uid())
            )
          )
        )
    )
  );

create policy "parts_insert_engineering" on maintenance_request_parts for insert to authenticated
  with check (is_admin() or is_engineering());
create policy "parts_update_engineering" on maintenance_request_parts for update to authenticated
  using (is_admin() or is_engineering());
create policy "parts_delete_engineering" on maintenance_request_parts for delete to authenticated
  using (is_admin() or is_engineering());

create policy "history_select_follows_request" on maintenance_request_history for select to authenticated
  using (
    exists (
      select 1 from maintenance_requests r
      where r.id = request_id
        and (
          is_admin() or is_engineering() or is_management()
          or (
            is_station_user() and (
              r.requested_by = auth.uid()
              or r.station_id = (select station_id from profiles where id = auth.uid())
              or r.department_id = (select department_id from profiles where id = auth.uid())
            )
          )
        )
    )
  );
-- No client insert policy: history rows are written only by the security
-- definer trigger functions and server actions using the service context.

create policy "assignments_select_follows_request" on maintenance_assignments for select to authenticated
  using (
    exists (
      select 1 from maintenance_requests r
      where r.id = request_id
        and (is_admin() or is_engineering() or is_management())
    )
  );
create policy "assignments_insert_engineering" on maintenance_assignments for insert to authenticated
  with check (is_admin() or is_engineering_manager());
create policy "assignments_update_engineering" on maintenance_assignments for update to authenticated
  using (is_admin() or is_engineering_manager());

-- ============================================================================
-- notifications: strictly own-recipient
-- ============================================================================

create policy "notifications_select_own" on notifications for select to authenticated
  using (recipient_id = auth.uid());
create policy "notifications_update_own" on notifications for update to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());
-- No client insert policy: notifications are created only via the
-- create_notification()/notify_engineering_team() security definer functions.

-- ============================================================================
-- feedback
-- ============================================================================

create policy "feedback_select_follows_request" on feedback for select to authenticated
  using (
    exists (
      select 1 from maintenance_requests r
      where r.id = request_id
        and (
          is_admin() or is_engineering() or is_management()
          or (
            is_station_user() and (
              r.requested_by = auth.uid()
              or r.station_id = (select station_id from profiles where id = auth.uid())
            )
          )
        )
    )
  );

create policy "feedback_insert_requester" on feedback for insert to authenticated
  with check (
    submitted_by = auth.uid()
    and exists (
      select 1 from maintenance_requests r
      where r.id = request_id
        and r.status in ('PENDING_CONFIRMATION', 'CLOSED')
        and (
          r.requested_by = auth.uid()
          or r.station_id = (select station_id from profiles where id = auth.uid())
          or r.department_id = (select department_id from profiles where id = auth.uid())
        )
    )
  );

-- ============================================================================
-- preventive maintenance
-- ============================================================================

create policy "pm_select_all_staff" on preventive_maintenance for select to authenticated
  using (is_admin() or is_engineering() or is_management() or is_station_user());
create policy "pm_write_admin_eng" on preventive_maintenance for insert to authenticated
  with check (is_admin() or is_engineering_manager());
create policy "pm_update_admin_eng" on preventive_maintenance for update to authenticated
  using (is_admin() or is_engineering_manager());
create policy "pm_delete_admin" on preventive_maintenance for delete to authenticated
  using (is_admin());

create policy "pm_tasks_select_all_staff" on preventive_maintenance_tasks for select to authenticated
  using (is_admin() or is_engineering() or is_management() or is_station_user());
create policy "pm_tasks_write_engineering" on preventive_maintenance_tasks for insert to authenticated
  with check (is_admin() or is_engineering());
create policy "pm_tasks_update_engineering" on preventive_maintenance_tasks for update to authenticated
  using (is_admin() or is_engineering());

-- ============================================================================
-- audit_logs: admin read-only, no client writes
-- ============================================================================

create policy "audit_select_admin" on audit_logs for select to authenticated
  using (is_admin());
-- No insert/update/delete policy for any client role: rows are written only
-- by security definer trigger functions.

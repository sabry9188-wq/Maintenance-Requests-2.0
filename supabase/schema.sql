-- ============================================================================
-- Maintenance Requests 2.0 - Database Schema
-- Run this FIRST in the Supabase SQL editor (see SETUP.md for full order).
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

create type user_role as enum (
  'ADMIN',
  'STATION_USER',
  'ENGINEERING_MANAGER',
  'ENGINEER',
  'MANAGEMENT_VIEW_ONLY'
);

create type request_status as enum (
  'SUBMITTED',
  'RECEIVED',
  'ACKNOWLEDGED',
  'ASSIGNED',
  'SCHEDULED',
  'IN_PROGRESS',
  'WAITING_FOR_PARTS',
  'WAITING_FOR_EXTERNAL_SUPPORT',
  'ON_HOLD',
  'COMPLETED',
  'PENDING_CONFIRMATION',
  'CLOSED',
  'REJECTED',
  'CANCELLED',
  'REOPENED'
);

create type priority_level as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

create type operational_state as enum ('YES', 'NO', 'PARTIALLY');

create type operational_impact_level as enum (
  'NO_IMPACT',
  'MINOR',
  'MODERATE',
  'MAJOR',
  'OPERATION_STOPPED'
);

create type notification_type as enum (
  'REQUEST_SUBMITTED',
  'ACKNOWLEDGED',
  'ASSIGNED',
  'WORK_STARTED',
  'STATUS_CHANGED',
  'WAITING_FOR_PARTS',
  'COMPLETED',
  'CONFIRMATION_REQUIRED',
  'REOPENED',
  'CLOSED'
);

create type notification_channel as enum ('IN_APP', 'EMAIL');

create type update_type as enum ('WORK_UPDATE', 'COMPLETION_REPORT');

create type problem_solved_state as enum ('YES', 'PARTIALLY', 'NO');

create type asset_status as enum ('OPERATIONAL', 'DOWN', 'UNDER_REPAIR', 'DECOMMISSIONED');

create type criticality_level as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

create type pm_status as enum ('ACTIVE', 'PAUSED', 'RETIRED');

create type pm_task_status as enum ('PENDING', 'DONE', 'OVERDUE', 'SKIPPED');

-- ============================================================================
-- SHARED TRIGGER FUNCTION: updated_at maintenance
-- ============================================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- REFERENCE / ADMIN-CONFIGURABLE TABLES
-- ============================================================================

create table stations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table areas (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references stations(id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_areas_station on areas(station_id);

create table maintenance_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  applies_to text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table maintenance_problem_types (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references maintenance_categories(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, name)
);
create index idx_problem_types_category on maintenance_problem_types(category_id);

create table assets (
  id uuid primary key default gen_random_uuid(),
  asset_code text not null unique,
  name text not null,
  station_id uuid not null references stations(id) on delete restrict,
  department_id uuid references departments(id) on delete set null,
  area_id uuid references areas(id) on delete set null,
  equipment_type text,
  manufacturer text,
  model text,
  serial_number text,
  installation_date date,
  status asset_status not null default 'OPERATIONAL',
  criticality criticality_level not null default 'MEDIUM',
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_assets_station on assets(station_id);
create index idx_assets_department on assets(department_id);
create index idx_assets_code on assets(asset_code);

create table sla_config (
  id uuid primary key default gen_random_uuid(),
  priority priority_level not null unique,
  response_time_minutes int not null,
  description text,
  updated_at timestamptz not null default now()
);

create table request_status_transitions (
  from_status request_status not null,
  to_status request_status not null,
  allowed_roles user_role[] not null,
  primary key (from_status, to_status)
);

-- ============================================================================
-- IDENTITY
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  employee_id text,
  phone text,
  role user_role not null default 'STATION_USER',
  station_id uuid references stations(id) on delete set null,
  department_id uuid references departments(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_profiles_role on profiles(role);
create index idx_profiles_station on profiles(station_id);
create index idx_profiles_department on profiles(department_id);

-- ============================================================================
-- REQUEST NUMBER COUNTER (see functions.sql for generator function/trigger)
-- ============================================================================

create table request_number_counters (
  year_yy text primary key,
  last_value bigint not null default 0
);

-- ============================================================================
-- MAINTENANCE REQUESTS - core table
-- ============================================================================

create table maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text unique,

  requested_by uuid not null references profiles(id) on delete restrict,
  station_id uuid not null references stations(id) on delete restrict,
  department_id uuid not null references departments(id) on delete restrict,
  area_id uuid references areas(id) on delete set null,
  asset_id uuid references assets(id) on delete set null,
  category_id uuid not null references maintenance_categories(id) on delete restrict,
  problem_type_id uuid not null references maintenance_problem_types(id) on delete restrict,

  priority priority_level not null default 'MEDIUM',
  status request_status not null default 'SUBMITTED',

  problem_title text not null check (btrim(problem_title) <> ''),
  problem_description text not null check (btrim(problem_description) <> ''),
  problem_started_at timestamptz,

  is_operational operational_state,
  operational_impact operational_impact_level,
  safety_risk boolean not null default false,
  production_impact boolean not null default false,

  additional_comments text,

  assigned_technician_id uuid references profiles(id) on delete set null,

  rejection_reason text,
  reopen_reason text,

  acknowledged_at timestamptz,
  assigned_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  confirmed_at timestamptz,
  closed_at timestamptz,
  reopened_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_requests_station on maintenance_requests(station_id);
create index idx_requests_department on maintenance_requests(department_id);
create index idx_requests_status on maintenance_requests(status);
create index idx_requests_priority on maintenance_requests(priority);
create index idx_requests_technician on maintenance_requests(assigned_technician_id);
create index idx_requests_created_at on maintenance_requests(created_at);
create index idx_requests_category on maintenance_requests(category_id);
create index idx_requests_asset on maintenance_requests(asset_id);
create index idx_requests_requested_by on maintenance_requests(requested_by);
create index idx_requests_title_trgm on maintenance_requests using gin (problem_title gin_trgm_ops);
create index idx_requests_description_trgm on maintenance_requests using gin (problem_description gin_trgm_ops);

-- ============================================================================
-- ATTACHMENTS
-- ============================================================================

create table maintenance_request_attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references maintenance_requests(id) on delete cascade,
  uploaded_by uuid not null references profiles(id) on delete restrict,
  file_path text not null,
  file_name text,
  file_type text,
  attachment_kind text not null default 'REQUEST_PHOTO',
  created_at timestamptz not null default now()
);
create index idx_attachments_request on maintenance_request_attachments(request_id);

-- ============================================================================
-- WORK UPDATES + COMPLETION REPORT (same table, tagged by update_type)
-- ============================================================================

create table maintenance_request_updates (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references maintenance_requests(id) on delete cascade,
  technician_id uuid references profiles(id) on delete set null,
  update_type update_type not null default 'WORK_UPDATE',
  work_status request_status,

  work_description text,
  diagnosis text,
  action_taken text,
  additional_notes text,

  -- completion-report-specific fields (nullable, populated when update_type = 'COMPLETION_REPORT')
  root_cause text,
  problem_found text,
  work_performed text,
  downtime_minutes int,
  total_labour_hours numeric(6, 2),
  external_contractor_used boolean not null default false,
  contractor_name text,
  final_remarks text,

  created_at timestamptz not null default now()
);
create index idx_updates_request on maintenance_request_updates(request_id, created_at);

-- ============================================================================
-- PARTS / MATERIALS USED
-- ============================================================================

create table maintenance_request_parts (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references maintenance_requests(id) on delete cascade,
  update_id uuid references maintenance_request_updates(id) on delete set null,
  part_name text not null,
  part_number text,
  quantity numeric(10, 2) not null default 1,
  unit text,
  unit_cost numeric(12, 2),
  total_cost numeric(12, 2) generated always as (quantity * coalesce(unit_cost, 0)) stored,
  remarks text,
  created_at timestamptz not null default now()
);
create index idx_parts_request on maintenance_request_parts(request_id);

-- ============================================================================
-- TIMELINE / HISTORY (per-request activity feed)
-- ============================================================================

create table maintenance_request_history (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references maintenance_requests(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  old_status request_status,
  new_status request_status,
  comment text,
  created_at timestamptz not null default now()
);
create index idx_history_request on maintenance_request_history(request_id, created_at);

-- ============================================================================
-- ASSIGNMENTS (reassignment history)
-- ============================================================================

create table maintenance_assignments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references maintenance_requests(id) on delete cascade,
  technician_id uuid not null references profiles(id) on delete restrict,
  assigned_by uuid references profiles(id) on delete set null,
  assigned_at timestamptz not null default now(),
  unassigned_at timestamptz
);
create index idx_assignments_request on maintenance_assignments(request_id);
create index idx_assignments_technician on maintenance_assignments(technician_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references profiles(id) on delete cascade,
  request_id uuid references maintenance_requests(id) on delete cascade,
  type notification_type not null,
  channel notification_channel not null default 'IN_APP',
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_recipient on notifications(recipient_id, is_read);
create index idx_notifications_created_at on notifications(created_at);

-- ============================================================================
-- FEEDBACK
-- ============================================================================

create table feedback (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references maintenance_requests(id) on delete cascade,
  submitted_by uuid not null references profiles(id) on delete restrict,
  problem_solved problem_solved_state not null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- PREVENTIVE MAINTENANCE
-- ============================================================================

create table preventive_maintenance (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  maintenance_type text not null,
  frequency_days int not null check (frequency_days > 0),
  next_due_date date not null,
  responsible_person_id uuid references profiles(id) on delete set null,
  checklist jsonb not null default '[]'::jsonb,
  status pm_status not null default 'ACTIVE',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_pm_asset on preventive_maintenance(asset_id);
create index idx_pm_next_due on preventive_maintenance(next_due_date);

create table preventive_maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  pm_id uuid not null references preventive_maintenance(id) on delete cascade,
  due_date date not null,
  completed_at timestamptz,
  completed_by uuid references profiles(id) on delete set null,
  status pm_task_status not null default 'PENDING',
  notes text,
  created_at timestamptz not null default now()
);
create index idx_pm_tasks_pm on preventive_maintenance_tasks(pm_id, due_date);
create index idx_pm_tasks_status on preventive_maintenance_tasks(status);

-- ============================================================================
-- AUDIT LOG (admin-only, trigger/RPC populated)
-- ============================================================================

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  table_name text,
  record_id uuid,
  request_number text,
  old_status text,
  new_status text,
  comment text,
  created_at timestamptz not null default now()
);
create index idx_audit_created_at on audit_logs(created_at);
create index idx_audit_request_number on audit_logs(request_number);
create index idx_audit_user on audit_logs(user_id);

-- ============================================================================
-- updated_at triggers
-- ============================================================================

create trigger trg_stations_updated_at before update on stations
  for each row execute function set_updated_at();
create trigger trg_departments_updated_at before update on departments
  for each row execute function set_updated_at();
create trigger trg_areas_updated_at before update on areas
  for each row execute function set_updated_at();
create trigger trg_categories_updated_at before update on maintenance_categories
  for each row execute function set_updated_at();
create trigger trg_problem_types_updated_at before update on maintenance_problem_types
  for each row execute function set_updated_at();
create trigger trg_assets_updated_at before update on assets
  for each row execute function set_updated_at();
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger trg_requests_updated_at before update on maintenance_requests
  for each row execute function set_updated_at();
create trigger trg_pm_updated_at before update on preventive_maintenance
  for each row execute function set_updated_at();

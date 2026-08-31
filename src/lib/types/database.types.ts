// Hand-written to match /supabase/schema.sql. If you change the schema,
// update this file (or regenerate with `supabase gen types typescript`
// once you have a live project linked - see SETUP.md).

export type UserRole =
  | "ADMIN"
  | "STATION_USER"
  | "ENGINEERING_MANAGER"
  | "ENGINEER"
  | "MANAGEMENT_VIEW_ONLY";

export type RequestStatus =
  | "SUBMITTED"
  | "RECEIVED"
  | "ACKNOWLEDGED"
  | "ASSIGNED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "WAITING_FOR_PARTS"
  | "WAITING_FOR_EXTERNAL_SUPPORT"
  | "ON_HOLD"
  | "COMPLETED"
  | "PENDING_CONFIRMATION"
  | "CLOSED"
  | "REJECTED"
  | "CANCELLED"
  | "REOPENED";

export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type OperationalState = "YES" | "NO" | "PARTIALLY";
export type OperationalImpactLevel =
  | "NO_IMPACT"
  | "MINOR"
  | "MODERATE"
  | "MAJOR"
  | "OPERATION_STOPPED";
export type NotificationType =
  | "REQUEST_SUBMITTED"
  | "ACKNOWLEDGED"
  | "ASSIGNED"
  | "WORK_STARTED"
  | "STATUS_CHANGED"
  | "WAITING_FOR_PARTS"
  | "COMPLETED"
  | "CONFIRMATION_REQUIRED"
  | "REOPENED"
  | "CLOSED";
export type NotificationChannel = "IN_APP" | "EMAIL";
export type UpdateType = "WORK_UPDATE" | "COMPLETION_REPORT";
export type ProblemSolvedState = "YES" | "PARTIALLY" | "NO";
export type AssetStatus = "OPERATIONAL" | "DOWN" | "UNDER_REPAIR" | "DECOMMISSIONED";
export type CriticalityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type PmStatus = "ACTIVE" | "PAUSED" | "RETIRED";
export type PmTaskStatus = "PENDING" | "DONE" | "OVERDUE" | "SKIPPED";

interface Timestamps {
  created_at: string;
  updated_at: string;
}

export interface StationRow extends Timestamps {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface DepartmentRow extends Timestamps {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface AreaRow extends Timestamps {
  id: string;
  station_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface MaintenanceCategoryRow extends Timestamps {
  id: string;
  name: string;
  applies_to: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface MaintenanceProblemTypeRow extends Timestamps {
  id: string;
  category_id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
}

export interface AssetRow extends Timestamps {
  id: string;
  asset_code: string;
  name: string;
  station_id: string;
  department_id: string | null;
  area_id: string | null;
  equipment_type: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  installation_date: string | null;
  status: AssetStatus;
  criticality: CriticalityLevel;
  notes: string | null;
  is_active: boolean;
}

export interface SlaConfigRow {
  id: string;
  priority: PriorityLevel;
  response_time_minutes: number;
  description: string | null;
  updated_at: string;
}

export interface RequestStatusTransitionRow {
  from_status: RequestStatus;
  to_status: RequestStatus;
  allowed_roles: UserRole[];
}

export interface ProfileRow extends Timestamps {
  id: string;
  full_name: string;
  email: string;
  employee_id: string | null;
  phone: string | null;
  role: UserRole;
  station_id: string | null;
  department_id: string | null;
  is_active: boolean;
}

export interface MaintenanceRequestRow extends Timestamps {
  id: string;
  request_number: string;
  requested_by: string;
  station_id: string;
  department_id: string;
  area_id: string | null;
  asset_id: string | null;
  category_id: string;
  problem_type_id: string;
  priority: PriorityLevel;
  status: RequestStatus;
  problem_title: string;
  problem_description: string;
  problem_started_at: string | null;
  is_operational: OperationalState | null;
  operational_impact: OperationalImpactLevel | null;
  safety_risk: boolean;
  production_impact: boolean;
  additional_comments: string | null;
  assigned_technician_id: string | null;
  rejection_reason: string | null;
  reopen_reason: string | null;
  acknowledged_at: string | null;
  assigned_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  confirmed_at: string | null;
  closed_at: string | null;
  reopened_at: string | null;
}

export interface MaintenanceRequestAttachmentRow {
  id: string;
  request_id: string;
  uploaded_by: string;
  file_path: string;
  file_name: string | null;
  file_type: string | null;
  attachment_kind: string;
  created_at: string;
}

export interface MaintenanceRequestUpdateRow {
  id: string;
  request_id: string;
  technician_id: string | null;
  update_type: UpdateType;
  work_status: RequestStatus | null;
  work_description: string | null;
  diagnosis: string | null;
  action_taken: string | null;
  additional_notes: string | null;
  root_cause: string | null;
  problem_found: string | null;
  work_performed: string | null;
  downtime_minutes: number | null;
  total_labour_hours: number | null;
  external_contractor_used: boolean;
  contractor_name: string | null;
  final_remarks: string | null;
  created_at: string;
}

export interface MaintenanceRequestPartRow {
  id: string;
  request_id: string;
  update_id: string | null;
  part_name: string;
  part_number: string | null;
  quantity: number;
  unit: string | null;
  unit_cost: number | null;
  total_cost: number | null;
  remarks: string | null;
  created_at: string;
}

export interface MaintenanceRequestHistoryRow {
  id: string;
  request_id: string;
  actor_id: string | null;
  action: string;
  old_status: RequestStatus | null;
  new_status: RequestStatus | null;
  comment: string | null;
  created_at: string;
}

export interface MaintenanceAssignmentRow {
  id: string;
  request_id: string;
  technician_id: string;
  assigned_by: string | null;
  assigned_at: string;
  unassigned_at: string | null;
}

export interface NotificationRow {
  id: string;
  recipient_id: string;
  request_id: string | null;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
}

export interface FeedbackRow {
  id: string;
  request_id: string;
  submitted_by: string;
  problem_solved: ProblemSolvedState;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface PreventiveMaintenanceRow extends Timestamps {
  id: string;
  asset_id: string;
  maintenance_type: string;
  frequency_days: number;
  next_due_date: string;
  responsible_person_id: string | null;
  checklist: { item: string; done: boolean }[];
  status: PmStatus;
  notes: string | null;
}

export interface PreventiveMaintenanceTaskRow {
  id: string;
  pm_id: string;
  due_date: string;
  completed_at: string | null;
  completed_by: string | null;
  status: PmTaskStatus;
  notes: string | null;
  created_at: string;
}

export interface AuditLogRow {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  request_number: string | null;
  old_status: string | null;
  new_status: string | null;
  comment: string | null;
  created_at: string;
}

type TableDef<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
};

export interface Database {
  public: {
    Tables: {
      stations: TableDef<
        StationRow,
        Partial<Pick<StationRow, "id" | "created_at" | "updated_at">> &
          Pick<StationRow, "code" | "name">
      >;
      departments: TableDef<
        DepartmentRow,
        Partial<Pick<DepartmentRow, "id" | "created_at" | "updated_at">> &
          Pick<DepartmentRow, "name">
      >;
      areas: TableDef<
        AreaRow,
        Partial<Pick<AreaRow, "id" | "created_at" | "updated_at">> &
          Pick<AreaRow, "station_id" | "name">
      >;
      maintenance_categories: TableDef<
        MaintenanceCategoryRow,
        Partial<Pick<MaintenanceCategoryRow, "id" | "created_at" | "updated_at">> &
          Pick<MaintenanceCategoryRow, "name">
      >;
      maintenance_problem_types: TableDef<
        MaintenanceProblemTypeRow,
        Partial<Pick<MaintenanceProblemTypeRow, "id" | "created_at" | "updated_at">> &
          Pick<MaintenanceProblemTypeRow, "category_id" | "name">
      >;
      assets: TableDef<
        AssetRow,
        Partial<Pick<AssetRow, "id" | "created_at" | "updated_at">> &
          Pick<AssetRow, "asset_code" | "name" | "station_id">
      >;
      sla_config: TableDef<SlaConfigRow, Partial<SlaConfigRow>>;
      request_status_transitions: TableDef<
        RequestStatusTransitionRow,
        RequestStatusTransitionRow
      >;
      profiles: TableDef<ProfileRow, Partial<ProfileRow> & Pick<ProfileRow, "id" | "full_name" | "email">>;
      maintenance_requests: TableDef<
        MaintenanceRequestRow,
        Partial<
          Pick<
            MaintenanceRequestRow,
            | "id"
            | "request_number"
            | "created_at"
            | "updated_at"
            | "status"
            | "priority"
            | "area_id"
            | "asset_id"
            | "problem_started_at"
            | "is_operational"
            | "operational_impact"
            | "safety_risk"
            | "production_impact"
            | "additional_comments"
            | "assigned_technician_id"
            | "rejection_reason"
            | "reopen_reason"
            | "acknowledged_at"
            | "assigned_at"
            | "started_at"
            | "completed_at"
            | "confirmed_at"
            | "closed_at"
            | "reopened_at"
          >
        > &
          Pick<
            MaintenanceRequestRow,
            | "requested_by"
            | "station_id"
            | "department_id"
            | "category_id"
            | "problem_type_id"
            | "problem_title"
            | "problem_description"
          >
      >;
      maintenance_request_attachments: TableDef<
        MaintenanceRequestAttachmentRow,
        Partial<Pick<MaintenanceRequestAttachmentRow, "id" | "created_at" | "attachment_kind">> &
          Pick<MaintenanceRequestAttachmentRow, "request_id" | "uploaded_by" | "file_path">
      >;
      maintenance_request_updates: TableDef<
        MaintenanceRequestUpdateRow,
        Partial<Omit<MaintenanceRequestUpdateRow, "id" | "request_id">> &
          Pick<MaintenanceRequestUpdateRow, "request_id">
      >;
      maintenance_request_parts: TableDef<
        MaintenanceRequestPartRow,
        Partial<Pick<MaintenanceRequestPartRow, "id" | "created_at" | "update_id" | "unit" | "unit_cost" | "remarks" | "part_number">> &
          Pick<MaintenanceRequestPartRow, "request_id" | "part_name" | "quantity">
      >;
      maintenance_request_history: TableDef<
        MaintenanceRequestHistoryRow,
        Partial<Pick<MaintenanceRequestHistoryRow, "id" | "created_at" | "actor_id" | "old_status" | "new_status" | "comment">> &
          Pick<MaintenanceRequestHistoryRow, "request_id" | "action">
      >;
      maintenance_assignments: TableDef<
        MaintenanceAssignmentRow,
        Partial<Pick<MaintenanceAssignmentRow, "id" | "assigned_at" | "unassigned_at" | "assigned_by">> &
          Pick<MaintenanceAssignmentRow, "request_id" | "technician_id">
      >;
      notifications: TableDef<
        NotificationRow,
        Partial<Pick<NotificationRow, "id" | "created_at" | "is_read" | "channel" | "request_id" | "body">> &
          Pick<NotificationRow, "recipient_id" | "type" | "title">
      >;
      feedback: TableDef<
        FeedbackRow,
        Partial<Pick<FeedbackRow, "id" | "created_at" | "comment">> &
          Pick<FeedbackRow, "request_id" | "submitted_by" | "problem_solved" | "rating">
      >;
      preventive_maintenance: TableDef<
        PreventiveMaintenanceRow,
        Partial<Pick<PreventiveMaintenanceRow, "id" | "created_at" | "updated_at" | "checklist" | "status" | "notes" | "responsible_person_id">> &
          Pick<PreventiveMaintenanceRow, "asset_id" | "maintenance_type" | "frequency_days" | "next_due_date">
      >;
      preventive_maintenance_tasks: TableDef<
        PreventiveMaintenanceTaskRow,
        Partial<Pick<PreventiveMaintenanceTaskRow, "id" | "created_at" | "completed_at" | "completed_by" | "status" | "notes">> &
          Pick<PreventiveMaintenanceTaskRow, "pm_id" | "due_date">
      >;
      audit_logs: TableDef<AuditLogRow, Partial<AuditLogRow>>;
    };
  };
}

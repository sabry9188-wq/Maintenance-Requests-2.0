import type {
  AssetRow,
  MaintenanceRequestRow,
  PriorityLevel,
  ProfileRow,
  RequestStatus,
} from "./database.types";

export const REQUEST_STATUSES: RequestStatus[] = [
  "SUBMITTED",
  "RECEIVED",
  "ACKNOWLEDGED",
  "ASSIGNED",
  "SCHEDULED",
  "IN_PROGRESS",
  "WAITING_FOR_PARTS",
  "WAITING_FOR_EXTERNAL_SUPPORT",
  "ON_HOLD",
  "COMPLETED",
  "PENDING_CONFIRMATION",
  "CLOSED",
  "REJECTED",
  "CANCELLED",
  "REOPENED",
];

export const STATUS_LABELS: Record<RequestStatus, string> = {
  SUBMITTED: "Submitted",
  RECEIVED: "Received",
  ACKNOWLEDGED: "Acknowledged",
  ASSIGNED: "Assigned",
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  WAITING_FOR_PARTS: "Waiting for Parts",
  WAITING_FOR_EXTERNAL_SUPPORT: "Waiting for External Support",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  PENDING_CONFIRMATION: "Pending Confirmation",
  CLOSED: "Closed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  REOPENED: "Reopened",
};

export const OPEN_STATUSES: RequestStatus[] = [
  "SUBMITTED",
  "RECEIVED",
  "ACKNOWLEDGED",
  "ASSIGNED",
  "SCHEDULED",
  "IN_PROGRESS",
  "WAITING_FOR_PARTS",
  "WAITING_FOR_EXTERNAL_SUPPORT",
  "ON_HOLD",
  "REOPENED",
];

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const PRIORITIES: PriorityLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export interface RequestListItem extends MaintenanceRequestRow {
  station: { id: string; code: string; name: string } | null;
  department: { id: string; name: string } | null;
  category: { id: string; name: string } | null;
  problem_type: { id: string; name: string } | null;
  assigned_technician: { id: string; full_name: string } | null;
  requester: { id: string; full_name: string } | null;
}

export interface RequestDetail extends RequestListItem {
  area: { id: string; name: string } | null;
  asset: Pick<AssetRow, "id" | "asset_code" | "name"> | null;
}

export type StaffProfile = Pick<ProfileRow, "id" | "full_name" | "role">;

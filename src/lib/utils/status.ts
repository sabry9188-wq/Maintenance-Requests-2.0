import type { RequestStatus, UserRole } from "@/lib/types/database.types";

/**
 * Mirrors the `request_status_transitions` table seeded in /supabase/seed.sql.
 * This is only used to decide which action buttons to render - the database
 * trigger (validate_status_transition in functions.sql) is the actual source
 * of truth and enforcement point.
 */
export const STATUS_TRANSITIONS: Record<
  RequestStatus,
  Partial<Record<RequestStatus, UserRole[]>>
> = {
  SUBMITTED: {
    RECEIVED: ["ENGINEERING_MANAGER", "ENGINEER"],
    REJECTED: ["ENGINEERING_MANAGER"],
    CANCELLED: ["STATION_USER"],
  },
  RECEIVED: {
    ACKNOWLEDGED: ["ENGINEERING_MANAGER", "ENGINEER"],
    REJECTED: ["ENGINEERING_MANAGER"],
    CANCELLED: ["STATION_USER"],
  },
  ACKNOWLEDGED: {
    ASSIGNED: ["ENGINEERING_MANAGER"],
    REJECTED: ["ENGINEERING_MANAGER"],
    CANCELLED: ["STATION_USER"],
  },
  ASSIGNED: {
    SCHEDULED: ["ENGINEERING_MANAGER", "ENGINEER"],
    IN_PROGRESS: ["ENGINEERING_MANAGER", "ENGINEER"],
  },
  SCHEDULED: {
    IN_PROGRESS: ["ENGINEERING_MANAGER", "ENGINEER"],
  },
  IN_PROGRESS: {
    WAITING_FOR_PARTS: ["ENGINEERING_MANAGER", "ENGINEER"],
    WAITING_FOR_EXTERNAL_SUPPORT: ["ENGINEERING_MANAGER", "ENGINEER"],
    ON_HOLD: ["ENGINEERING_MANAGER", "ENGINEER"],
    COMPLETED: ["ENGINEERING_MANAGER", "ENGINEER"],
  },
  WAITING_FOR_PARTS: {
    IN_PROGRESS: ["ENGINEERING_MANAGER", "ENGINEER"],
  },
  WAITING_FOR_EXTERNAL_SUPPORT: {
    IN_PROGRESS: ["ENGINEERING_MANAGER", "ENGINEER"],
  },
  ON_HOLD: {
    IN_PROGRESS: ["ENGINEERING_MANAGER", "ENGINEER"],
  },
  COMPLETED: {
    PENDING_CONFIRMATION: ["ENGINEERING_MANAGER", "ENGINEER"],
  },
  PENDING_CONFIRMATION: {
    CLOSED: ["STATION_USER"],
    REOPENED: ["STATION_USER"],
  },
  REOPENED: {
    ACKNOWLEDGED: ["ENGINEERING_MANAGER"],
    ASSIGNED: ["ENGINEERING_MANAGER"],
    IN_PROGRESS: ["ENGINEERING_MANAGER", "ENGINEER"],
  },
  CLOSED: {
    REOPENED: ["ADMIN"],
  },
  REJECTED: {},
  CANCELLED: {},
};

export function allowedNextStatuses(
  current: RequestStatus,
  role: UserRole
): RequestStatus[] {
  const transitions = STATUS_TRANSITIONS[current] ?? {};
  if (role === "ADMIN") {
    return Object.keys(transitions) as RequestStatus[];
  }
  return (Object.keys(transitions) as RequestStatus[]).filter((to) =>
    transitions[to]?.includes(role)
  );
}

export function canTransition(current: RequestStatus, target: RequestStatus, role: UserRole) {
  return allowedNextStatuses(current, role).includes(target);
}

export const TERMINAL_STATUSES: RequestStatus[] = ["CLOSED", "REJECTED", "CANCELLED"];

export function isTerminal(status: RequestStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

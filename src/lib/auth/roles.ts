import type { UserRole } from "@/lib/types/database.types";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  STATION_USER: "Station / Department User",
  ENGINEERING_MANAGER: "Engineering Manager",
  ENGINEER: "Engineer / Technician",
  MANAGEMENT_VIEW_ONLY: "Management (View Only)",
};

export const ALL_ROLES: UserRole[] = [
  "ADMIN",
  "STATION_USER",
  "ENGINEERING_MANAGER",
  "ENGINEER",
  "MANAGEMENT_VIEW_ONLY",
];

export const ENGINEERING_ROLES: UserRole[] = ["ENGINEERING_MANAGER", "ENGINEER"];

export function isEngineeringRole(role: UserRole): boolean {
  return ENGINEERING_ROLES.includes(role);
}

export function canCreateRequests(role: UserRole): boolean {
  return role === "STATION_USER" || role === "ENGINEERING_MANAGER" || role === "ADMIN";
}

export function canManageWorkflow(role: UserRole): boolean {
  return role === "ENGINEERING_MANAGER" || role === "ADMIN";
}

export function isReadOnly(role: UserRole): boolean {
  return role === "MANAGEMENT_VIEW_ONLY";
}

export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN";
}

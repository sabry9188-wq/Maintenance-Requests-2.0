import type { PriorityLevel } from "@/lib/types/database.types";
import { ageInMinutes } from "./request-age";

export interface SlaConfigMap {
  [priority: string]: number; // response_time_minutes
}

/** Overdue = still open (no acknowledged_at) and past the SLA response window for its priority. */
export function isOverdue(
  priority: PriorityLevel,
  createdAt: string,
  acknowledgedAt: string | null,
  slaConfig: SlaConfigMap
): boolean {
  if (acknowledgedAt) return false;
  const limit = slaConfig[priority];
  if (limit === undefined) return false;
  if (limit === 0) return ageInMinutes(createdAt) > 0; // CRITICAL = immediate
  return ageInMinutes(createdAt) > limit;
}

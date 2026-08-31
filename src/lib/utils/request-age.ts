const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Human readable elapsed time, e.g. "15 minutes", "2 hours", "3 days". */
export function formatAge(fromIso: string, toDate: Date = new Date()): string {
  const from = new Date(fromIso).getTime();
  const to = toDate.getTime();
  const diffMs = Math.max(0, to - from);

  if (diffMs < MINUTE) return "Just now";
  if (diffMs < HOUR) {
    const minutes = Math.floor(diffMs / MINUTE);
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  }
  if (diffMs < DAY) {
    const hours = Math.floor(diffMs / HOUR);
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  const days = Math.floor(diffMs / DAY);
  return `${days} day${days === 1 ? "" : "s"}`;
}

export function ageInMinutes(fromIso: string, toDate: Date = new Date()): number {
  return Math.max(0, (toDate.getTime() - new Date(fromIso).getTime()) / MINUTE);
}

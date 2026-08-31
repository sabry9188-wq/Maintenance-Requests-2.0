import { formatDateTime } from "@/lib/utils/format";
import { STATUS_LABELS } from "@/lib/types/domain";
import type { MaintenanceRequestHistoryRow } from "@/lib/types/database.types";

type HistoryEntry = MaintenanceRequestHistoryRow & { actor: { full_name: string } | null };

function describeEntry(entry: HistoryEntry): string {
  if (entry.action === "STATUS_CHANGED" && entry.new_status) {
    return `Status changed to ${STATUS_LABELS[entry.new_status]}`;
  }
  if (entry.action === "SUBMITTED") return "Request submitted";
  if (entry.action === "ASSIGNED") return entry.comment ?? "Technician assigned";
  if (entry.action === "WORK_UPDATE") return entry.comment ? `Work update: ${entry.comment}` : "Work update added";
  if (entry.action === "REOPENED") return entry.comment ? `Reopened: ${entry.comment}` : "Request reopened";
  if (entry.action === "COMMENT_ADDED") return entry.comment ?? "Comment added";
  if (entry.action === "FEEDBACK_SUBMITTED") return entry.comment ?? "Feedback submitted";
  return entry.comment ?? entry.action;
}

export function RequestTimeline({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) {
    return <p className="py-6 text-center text-sm text-neutral-400">No activity yet.</p>;
  }

  return (
    <ol className="relative border-l border-neutral-200 pl-5">
      {history.map((entry) => (
        <li key={entry.id} className="mb-6 last:mb-0">
          <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary-600" />
          <p className="text-xs text-neutral-400">{formatDateTime(entry.created_at)}</p>
          <p className="mt-0.5 text-sm font-medium text-neutral-800">{describeEntry(entry)}</p>
          {entry.actor && <p className="text-xs text-neutral-500">by {entry.actor.full_name}</p>}
        </li>
      ))}
    </ol>
  );
}

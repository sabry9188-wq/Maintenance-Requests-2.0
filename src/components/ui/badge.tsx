import { cn } from "@/lib/utils/cn";
import type { PriorityLevel, RequestStatus } from "@/lib/types/database.types";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/types/domain";

export function Badge({
  className,
  children,
  color = "neutral",
}: {
  className?: string;
  children: React.ReactNode;
  color?: "neutral" | "red" | "green" | "amber" | "blue" | "purple";
}) {
  const colors: Record<string, string> = {
    neutral: "bg-neutral-100 text-neutral-700 border-neutral-200",
    red: "bg-red-50 text-red-700 border-red-200",
    green: "bg-green-50 text-green-700 border-green-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        colors[color],
        className
      )}
    >
      {children}
    </span>
  );
}

const STATUS_COLORS: Record<RequestStatus, "neutral" | "red" | "green" | "amber" | "blue" | "purple"> = {
  SUBMITTED: "neutral",
  RECEIVED: "blue",
  ACKNOWLEDGED: "blue",
  ASSIGNED: "blue",
  SCHEDULED: "purple",
  IN_PROGRESS: "amber",
  WAITING_FOR_PARTS: "amber",
  WAITING_FOR_EXTERNAL_SUPPORT: "amber",
  ON_HOLD: "neutral",
  COMPLETED: "green",
  PENDING_CONFIRMATION: "purple",
  CLOSED: "neutral",
  REJECTED: "red",
  CANCELLED: "neutral",
  REOPENED: "red",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return <Badge color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>;
}

const PRIORITY_COLORS: Record<PriorityLevel, "neutral" | "red" | "green" | "amber" | "blue"> = {
  LOW: "green",
  MEDIUM: "amber",
  HIGH: "blue",
  CRITICAL: "red",
};

export function PriorityBadge({ priority }: { priority: PriorityLevel }) {
  const isCritical = priority === "CRITICAL";
  return (
    <Badge
      color={PRIORITY_COLORS[priority]}
      className={isCritical ? "border-primary-600 bg-primary-600 text-white font-semibold" : undefined}
    >
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}

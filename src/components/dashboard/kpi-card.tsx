import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "neutral" | "red" | "amber" | "green";
}) {
  const toneClasses: Record<string, string> = {
    neutral: "text-neutral-900",
    red: "text-primary-600",
    amber: "text-amber-600",
    green: "text-green-600",
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3.5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-neutral-300" />}
      </div>
      <p className={cn("mt-1.5 text-2xl font-semibold", toneClasses[tone])}>{value}</p>
    </div>
  );
}

export function KpiGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{children}</div>;
}

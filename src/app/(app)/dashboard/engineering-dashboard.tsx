import { listRequests, getDashboardCounts } from "@/lib/data/requests";
import { getReportData } from "@/lib/data/reports";
import { KpiCard, KpiGrid } from "@/components/dashboard/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SimpleBarChart } from "@/components/dashboard/charts/bar-chart";
import { NewRequestsQueue } from "@/components/dashboard/new-requests-queue";
import { OPEN_STATUSES } from "@/lib/types/domain";
import type { RequestListItem } from "@/lib/types/domain";

export async function EngineeringDashboard() {
  const [counts, byStation, byCategory, byStatus, byPriority, newRequests] = await Promise.all([
    getDashboardCounts(),
    getReportData("by-station"),
    getReportData("by-category"),
    getReportData("by-status"),
    getReportData("by-priority"),
    listRequests({ status: ["SUBMITTED"], pageSize: 10 }),
  ]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const open = OPEN_STATUSES.reduce((sum, s) => sum + (counts[s] ?? 0), 0);
  const priorityCounts = Object.fromEntries(
    (byPriority.rows as { label: string; count: number }[]).map((r) => [r.label, r.count])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Engineering Dashboard</h1>
        <p className="text-sm text-neutral-500">Overview of all maintenance requests across stations.</p>
      </div>

      <KpiGrid>
        <KpiCard label="Total Requests" value={total} />
        <KpiCard label="Open Requests" value={open} tone="amber" />
        <KpiCard label="New Requests" value={counts.SUBMITTED ?? 0} tone="red" />
        <KpiCard label="Critical Priority" value={priorityCounts.CRITICAL ?? 0} tone="red" />
        <KpiCard label="High Priority" value={priorityCounts.HIGH ?? 0} tone="amber" />
        <KpiCard label="In Progress" value={counts.IN_PROGRESS ?? 0} />
        <KpiCard label="Waiting for Parts" value={counts.WAITING_FOR_PARTS ?? 0} tone="amber" />
        <KpiCard label="Completed" value={counts.COMPLETED ?? 0} tone="green" />
        <KpiCard label="Pending Confirmation" value={counts.PENDING_CONFIRMATION ?? 0} />
        <KpiCard label="Closed" value={counts.CLOSED ?? 0} tone="green" />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Requests by Station</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={byStation.rows as { label: string; count: number }[]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Requests by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={(byCategory.rows as { label: string; count: number }[]).slice(0, 8)}
              horizontal
              color="#2563eb"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Requests by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={byStatus.rows as { label: string; count: number }[]} color="#d97706" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Requests</CardTitle>
        </CardHeader>
        <CardContent className="!p-0">
          <NewRequestsQueue requests={newRequests.data as unknown as RequestListItem[]} />
        </CardContent>
      </Card>
    </div>
  );
}

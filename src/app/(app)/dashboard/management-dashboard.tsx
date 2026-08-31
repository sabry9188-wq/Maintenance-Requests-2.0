import { getDashboardCounts } from "@/lib/data/requests";
import { getReportData } from "@/lib/data/reports";
import { KpiCard, KpiGrid } from "@/components/dashboard/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SimpleBarChart } from "@/components/dashboard/charts/bar-chart";
import { SimplePieChart } from "@/components/dashboard/charts/pie-chart";
import { OPEN_STATUSES } from "@/lib/types/domain";

export async function ManagementDashboard() {
  const [counts, byStation, byPriority, byMonth, avgResolution] = await Promise.all([
    getDashboardCounts(),
    getReportData("by-station"),
    getReportData("by-priority"),
    getReportData("by-month"),
    getReportData("avg-resolution-time"),
  ]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const open = OPEN_STATUSES.reduce((sum, s) => sum + (counts[s] ?? 0), 0);
  const closed = counts.CLOSED ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Management Overview</h1>
        <p className="text-sm text-neutral-500">Read-only view of maintenance performance across the organization.</p>
      </div>

      <KpiGrid>
        <KpiCard label="Total Requests" value={total} />
        <KpiCard label="Open Requests" value={open} tone="amber" />
        <KpiCard label="Closed Requests" value={closed} tone="green" />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
            <CardTitle>Requests by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <SimplePieChart data={byPriority.rows as { label: string; count: number }[]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={byMonth.rows as { label: string; count: number }[]} color="#2563eb" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Resolution Time by Priority (hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={(avgResolution.rows as { priority: string; avg_hours: number }[]).map((r) => ({
                label: r.priority,
                count: r.avg_hours,
              }))}
              color="#16a34a"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

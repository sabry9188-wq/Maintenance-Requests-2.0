import Link from "next/link";
import { listRequests, getDashboardCounts } from "@/lib/data/requests";
import { KpiCard, KpiGrid } from "@/components/dashboard/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils/format";
import { OPEN_STATUSES } from "@/lib/types/domain";
import { PlusCircle, ClipboardList } from "lucide-react";

export async function StationDashboard({ userId }: { userId: string }) {
  const [counts, recent] = await Promise.all([
    getDashboardCounts(userId),
    listRequests({ requested_by: userId, pageSize: 10 }),
  ]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const open = OPEN_STATUSES.reduce((sum, s) => sum + (counts[s] ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">My Dashboard</h1>
          <p className="text-sm text-neutral-500">Track the maintenance requests you have submitted.</p>
        </div>
        <Link href="/requests/new">
          <Button>
            <PlusCircle className="h-4 w-4" /> Create Request
          </Button>
        </Link>
      </div>

      <KpiGrid>
        <KpiCard label="My Requests" value={total} />
        <KpiCard label="Open" value={open} tone="amber" />
        <KpiCard label="In Progress" value={counts.IN_PROGRESS ?? 0} />
        <KpiCard label="Completed" value={counts.COMPLETED ?? 0} tone="green" />
        <KpiCard label="Waiting for Confirmation" value={counts.PENDING_CONFIRMATION ?? 0} tone="red" />
        <KpiCard label="Closed" value={counts.CLOSED ?? 0} tone="green" />
      </KpiGrid>

      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
        </CardHeader>
        <CardContent className="!p-0">
          {recent.data.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={ClipboardList}
                title="No requests yet"
                description="Create your first maintenance request to get started."
                action={
                  <Link href="/requests/new">
                    <Button size="sm">Create Request</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Request No.</Th>
                  <Th>Problem</Th>
                  <Th>Priority</Th>
                  <Th>Status</Th>
                  <Th>Submitted</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recent.data.map((r) => (
                  <Tr key={r.id} className="cursor-pointer">
                    <Td className="font-medium text-neutral-900">
                      <Link href={`/requests/${r.id}`}>{r.request_number}</Link>
                    </Td>
                    <Td className="max-w-xs truncate">{r.problem_title}</Td>
                    <Td>
                      <PriorityBadge priority={r.priority} />
                    </Td>
                    <Td>
                      <StatusBadge status={r.status} />
                    </Td>
                    <Td className="whitespace-nowrap">{formatDateTime(r.created_at)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

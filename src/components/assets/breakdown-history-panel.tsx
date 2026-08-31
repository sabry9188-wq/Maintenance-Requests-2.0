import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { KpiCard, KpiGrid } from "@/components/dashboard/kpi-card";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { getAssetBreakdownHistory } from "@/lib/data/assets";

export function BreakdownHistoryPanel({
  history,
}: {
  history: Awaited<ReturnType<typeof getAssetBreakdownHistory>>;
}) {
  return (
    <div className="space-y-4">
      <KpiGrid>
        <KpiCard label="Total Breakdowns" value={history.totalBreakdowns} />
        <KpiCard label="Last Breakdown" value={history.lastBreakdown ? formatDate(history.lastBreakdown) : "-"} />
        <KpiCard label="Total Maintenance Cost" value={formatCurrency(history.totalCost)} />
        <KpiCard
          label="Avg Repair Time"
          value={history.avgRepairHours !== null ? `${history.avgRepairHours.toFixed(1)} hrs` : "-"}
        />
      </KpiGrid>

      {history.requests.length === 0 ? (
        <p className="py-6 text-center text-sm text-neutral-400">No maintenance requests linked to this asset yet.</p>
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Request No.</Th>
              <Th>Problem</Th>
              <Th>Priority</Th>
              <Th>Status</Th>
              <Th>Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {history.requests.map((r) => (
              <Tr key={r.id}>
                <Td className="font-medium text-neutral-900">
                  <Link href={`/requests/${r.id}`} className="hover:text-primary-600 hover:underline">
                    {r.request_number}
                  </Link>
                </Td>
                <Td className="max-w-xs truncate">{r.problem_title}</Td>
                <Td>
                  <PriorityBadge priority={r.priority} />
                </Td>
                <Td>
                  <StatusBadge status={r.status} />
                </Td>
                <Td>{formatDate(r.created_at)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}

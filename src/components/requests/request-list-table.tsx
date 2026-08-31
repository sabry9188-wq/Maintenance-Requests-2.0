import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatAge } from "@/lib/utils/request-age";
import { formatDateTime } from "@/lib/utils/format";
import { ClipboardList } from "lucide-react";
import type { RequestListItem } from "@/lib/types/domain";

export function RequestListTable({ requests }: { requests: RequestListItem[] }) {
  if (requests.length === 0) {
    return (
      <div className="p-6">
        <EmptyState icon={ClipboardList} title="No requests found" description="Try adjusting your filters or search terms." />
      </div>
    );
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Request No.</Th>
          <Th>Station</Th>
          <Th>Department</Th>
          <Th>Problem</Th>
          <Th>Category</Th>
          <Th>Priority</Th>
          <Th>Submitted</Th>
          <Th>Age</Th>
          <Th>Status</Th>
          <Th>Technician</Th>
        </Tr>
      </Thead>
      <Tbody>
        {requests.map((r) => (
          <Tr key={r.id}>
            <Td className="font-medium text-neutral-900">
              <Link href={`/requests/${r.id}`} className="hover:text-primary-600 hover:underline">
                {r.request_number}
              </Link>
            </Td>
            <Td>{r.station?.name}</Td>
            <Td>{r.department?.name}</Td>
            <Td className="max-w-[220px] truncate">{r.problem_title}</Td>
            <Td>{r.category?.name}</Td>
            <Td>
              <PriorityBadge priority={r.priority} />
            </Td>
            <Td className="whitespace-nowrap">{formatDateTime(r.created_at)}</Td>
            <Td className="whitespace-nowrap">{formatAge(r.created_at)}</Td>
            <Td>
              <StatusBadge status={r.status} />
            </Td>
            <Td>{r.assigned_technician?.full_name ?? "-"}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

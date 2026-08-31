"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatAge } from "@/lib/utils/request-age";
import { formatDateTime } from "@/lib/utils/format";
import { acceptRequest } from "@/lib/actions/request-actions";
import { ClipboardList } from "lucide-react";
import type { RequestListItem } from "@/lib/types/domain";

export function NewRequestsQueue({ requests }: { requests: RequestListItem[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAccept(id: string) {
    startTransition(async () => {
      const result = await acceptRequest(id);
      if (result.success) {
        toast.success("Request accepted and acknowledged.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (requests.length === 0) {
    return <EmptyState icon={ClipboardList} title="No new requests" description="New submissions will appear here." />;
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Request No.</Th>
          <Th>Station</Th>
          <Th>Problem</Th>
          <Th>Priority</Th>
          <Th>Submitted</Th>
          <Th>Age</Th>
          <Th>Status</Th>
          <Th>Technician</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {requests.map((r) => (
          <Tr key={r.id}>
            <Td className="font-medium text-neutral-900">{r.request_number}</Td>
            <Td>{r.station?.name}</Td>
            <Td className="max-w-xs truncate">{r.problem_title}</Td>
            <Td>
              <PriorityBadge priority={r.priority} />
            </Td>
            <Td className="whitespace-nowrap">{formatDateTime(r.created_at)}</Td>
            <Td className="whitespace-nowrap">{formatAge(r.created_at)}</Td>
            <Td>
              <StatusBadge status={r.status} />
            </Td>
            <Td>{r.assigned_technician?.full_name ?? "-"}</Td>
            <Td>
              <div className="flex gap-2">
                <Link href={`/requests/${r.id}`}>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </Link>
                {r.status === "SUBMITTED" && (
                  <Button size="sm" disabled={isPending} onClick={() => handleAccept(r.id)}>
                    Accept
                  </Button>
                )}
              </div>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

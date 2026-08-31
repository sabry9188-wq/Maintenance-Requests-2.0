import { requireAdmin } from "@/lib/auth/require-role";
import { listAuditLogs } from "@/lib/data/audit-log";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils/format";
import { ShieldCheck } from "lucide-react";

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const result = await listAuditLogs({ request_number: params.request_number, page, pageSize: 50 });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Audit Log</h1>
        <p className="text-sm text-neutral-500">
          Complete, system-generated history of user actions and status changes. This log cannot be edited.
        </p>
      </div>
      <Card>
        {result.data.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={ShieldCheck} title="No audit entries yet" />
          </div>
        ) : (
          <>
            <Table>
              <Thead>
                <Tr>
                  <Th>Date/Time</Th>
                  <Th>User</Th>
                  <Th>Action</Th>
                  <Th>Request No.</Th>
                  <Th>Old Status</Th>
                  <Th>New Status</Th>
                  <Th>Comment</Th>
                </Tr>
              </Thead>
              <Tbody>
                {result.data.map((log) => (
                  <Tr key={log.id}>
                    <Td className="whitespace-nowrap">{formatDateTime(log.created_at)}</Td>
                    <Td>{(log as unknown as { user: { full_name: string } | null }).user?.full_name ?? "System"}</Td>
                    <Td>{log.action}</Td>
                    <Td>{log.request_number ?? "-"}</Td>
                    <Td>{log.old_status ?? "-"}</Td>
                    <Td>{log.new_status ?? "-"}</Td>
                    <Td className="max-w-[200px] truncate">{log.comment ?? "-"}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Pagination page={result.page} pageSize={result.pageSize} total={result.count} />
          </>
        )}
      </Card>
    </div>
  );
}

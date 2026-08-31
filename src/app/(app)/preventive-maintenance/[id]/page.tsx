import { notFound } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/get-session";
import { getPreventiveMaintenanceById, getPreventiveMaintenanceTasks } from "@/lib/data/preventive-maintenance";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { CompleteTaskButton } from "@/components/pm/complete-task-button";

export default async function PmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSessionUser();

  let pm;
  try {
    pm = await getPreventiveMaintenanceById(id);
  } catch {
    notFound();
  }
  if (!pm) notFound();

  const tasks = await getPreventiveMaintenanceTasks(id);
  const canComplete = session.profile.role === "ADMIN" || session.profile.role === "ENGINEERING_MANAGER" || session.profile.role === "ENGINEER";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{pm.maintenance_type}</CardTitle>
            <Badge color={pm.status === "ACTIVE" ? "green" : "neutral"}>{pm.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs uppercase text-neutral-400">Asset</p>
              <p className="font-medium text-neutral-800">
                {pm.asset ? `${pm.asset.asset_code} - ${pm.asset.name}` : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-neutral-400">Frequency</p>
              <p className="font-medium text-neutral-800">Every {pm.frequency_days} days</p>
            </div>
            <div>
              <p className="text-xs uppercase text-neutral-400">Next Due</p>
              <p className="font-medium text-neutral-800">{formatDate(pm.next_due_date)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-neutral-400">Responsible</p>
              <p className="font-medium text-neutral-800">{pm.responsible?.full_name ?? "-"}</p>
            </div>
          </div>
          {pm.notes && <p className="mt-3 text-sm text-neutral-600">{pm.notes}</p>}
          {canComplete && pm.status === "ACTIVE" && (
            <div className="mt-4">
              <CompleteTaskButton pmId={pm.id} dueDate={pm.next_due_date} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Completion History</CardTitle>
        </CardHeader>
        <CardContent className="!p-0">
          {tasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-400">No completed tasks yet.</p>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Due Date</Th>
                  <Th>Status</Th>
                  <Th>Completed At</Th>
                  <Th>Completed By</Th>
                  <Th>Notes</Th>
                </Tr>
              </Thead>
              <Tbody>
                {tasks.map((t) => (
                  <Tr key={t.id}>
                    <Td>{formatDate(t.due_date)}</Td>
                    <Td>
                      <Badge color={t.status === "DONE" ? "green" : "neutral"}>{t.status}</Badge>
                    </Td>
                    <Td>{t.completed_at ? formatDateTime(t.completed_at) : "-"}</Td>
                    <Td>{(t as unknown as { completed_by_profile: { full_name: string } | null }).completed_by_profile?.full_name ?? "-"}</Td>
                    <Td className="max-w-[200px] truncate">{t.notes ?? "-"}</Td>
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveSlaConfig } from "@/lib/actions/admin-actions";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PRIORITY_LABELS } from "@/lib/types/domain";
import type { SlaConfigRow } from "@/lib/types/database.types";

export function SlaConfigManager({ config }: { config: SlaConfigRow[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(config.map((c) => [c.priority, c.response_time_minutes]))
  );
  const [savingPriority, setSavingPriority] = useState<string | null>(null);

  async function handleSave(priority: SlaConfigRow["priority"], description: string | null) {
    setSavingPriority(priority);
    const result = await saveSlaConfig({
      priority,
      response_time_minutes: values[priority],
      description: description ?? "",
    });
    setSavingPriority(null);
    if (result.success) {
      toast.success(`SLA for ${PRIORITY_LABELS[priority]} updated.`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Priority</Th>
          <Th>Response Time (minutes)</Th>
          <Th>Description</Th>
          <Th></Th>
        </Tr>
      </Thead>
      <Tbody>
        {config.map((c) => (
          <Tr key={c.priority}>
            <Td className="font-medium text-neutral-900">{PRIORITY_LABELS[c.priority]}</Td>
            <Td>
              <Input
                type="number"
                className="w-28"
                value={values[c.priority] ?? 0}
                onChange={(e) => setValues((prev) => ({ ...prev, [c.priority]: Number(e.target.value) }))}
              />
            </Td>
            <Td className="text-neutral-500">{c.description ?? "-"}</Td>
            <Td>
              <Button size="sm" disabled={savingPriority === c.priority} onClick={() => handleSave(c.priority, c.description)}>
                Save
              </Button>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

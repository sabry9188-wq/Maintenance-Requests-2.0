import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils/format";
import type { MaintenanceRequestPartRow } from "@/lib/types/database.types";

export function PartsUsedTable({ parts }: { parts: MaintenanceRequestPartRow[] }) {
  if (parts.length === 0) {
    return <p className="py-6 text-center text-sm text-neutral-400">No parts recorded yet.</p>;
  }

  const total = parts.reduce((sum, p) => sum + (p.total_cost ?? 0), 0);

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Part Name</Th>
          <Th>Part No.</Th>
          <Th>Qty</Th>
          <Th>Unit</Th>
          <Th>Unit Cost</Th>
          <Th>Total</Th>
          <Th>Remarks</Th>
        </Tr>
      </Thead>
      <Tbody>
        {parts.map((p) => (
          <Tr key={p.id}>
            <Td className="font-medium text-neutral-900">{p.part_name}</Td>
            <Td>{p.part_number ?? "-"}</Td>
            <Td>{p.quantity}</Td>
            <Td>{p.unit ?? "-"}</Td>
            <Td>{formatCurrency(p.unit_cost)}</Td>
            <Td>{formatCurrency(p.total_cost)}</Td>
            <Td className="max-w-[160px] truncate">{p.remarks ?? "-"}</Td>
          </Tr>
        ))}
        <Tr>
          <Td colSpan={5} className="text-right font-semibold text-neutral-700">
            Total
          </Td>
          <Td className="font-semibold text-neutral-900">{formatCurrency(total)}</Td>
          <Td />
        </Tr>
      </Tbody>
    </Table>
  );
}

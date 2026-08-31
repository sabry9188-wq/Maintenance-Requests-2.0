import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils/format";
import { CalendarClock } from "lucide-react";

interface PmRow {
  id: string;
  maintenance_type: string;
  next_due_date: string;
  status: string;
  asset: { asset_code: string; name: string } | null;
  responsible: { full_name: string } | null;
}

export function PmTaskList({ items }: { items: PmRow[] }) {
  if (items.length === 0) {
    return <EmptyState icon={CalendarClock} title="No preventive maintenance plans yet" />;
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Asset</Th>
          <Th>Maintenance Type</Th>
          <Th>Next Due</Th>
          <Th>Responsible</Th>
          <Th>Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((item) => (
          <Tr key={item.id}>
            <Td className="font-medium text-neutral-900">
              <Link href={`/preventive-maintenance/${item.id}`} className="hover:text-primary-600 hover:underline">
                {item.asset ? `${item.asset.asset_code} - ${item.asset.name}` : "-"}
              </Link>
            </Td>
            <Td>{item.maintenance_type}</Td>
            <Td>
              <span className={item.next_due_date < today ? "font-medium text-primary-600" : ""}>
                {formatDate(item.next_due_date)}
              </span>
            </Td>
            <Td>{item.responsible?.full_name ?? "-"}</Td>
            <Td>
              <Badge color={item.status === "ACTIVE" ? "green" : "neutral"}>{item.status}</Badge>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

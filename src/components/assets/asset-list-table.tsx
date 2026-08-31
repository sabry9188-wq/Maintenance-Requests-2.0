import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Wrench } from "lucide-react";

interface AssetRow {
  id: string;
  asset_code: string;
  name: string;
  equipment_type: string | null;
  status: string;
  criticality: string;
  station: { name: string } | null;
}

const STATUS_COLORS: Record<string, "neutral" | "red" | "green" | "amber"> = {
  OPERATIONAL: "green",
  DOWN: "red",
  UNDER_REPAIR: "amber",
  DECOMMISSIONED: "neutral",
};

export function AssetListTable({ assets }: { assets: AssetRow[] }) {
  if (assets.length === 0) {
    return <EmptyState icon={Wrench} title="No assets yet" description="Add equipment/assets to link them to maintenance requests." />;
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Asset Code</Th>
          <Th>Name</Th>
          <Th>Station</Th>
          <Th>Type</Th>
          <Th>Criticality</Th>
          <Th>Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        {assets.map((a) => (
          <Tr key={a.id}>
            <Td className="font-medium text-neutral-900">
              <Link href={`/assets/${a.id}`} className="hover:text-primary-600 hover:underline">
                {a.asset_code}
              </Link>
            </Td>
            <Td>{a.name}</Td>
            <Td>{a.station?.name ?? "-"}</Td>
            <Td>{a.equipment_type ?? "-"}</Td>
            <Td>{a.criticality}</Td>
            <Td>
              <Badge color={STATUS_COLORS[a.status] ?? "neutral"}>{a.status.replace(/_/g, " ")}</Badge>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

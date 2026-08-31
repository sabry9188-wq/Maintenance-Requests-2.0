import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";
import type { ReportResult } from "@/lib/data/reports";

export function ReportTable({ report }: { report: ReportResult }) {
  if (report.rows.length === 0) {
    return <EmptyState icon={BarChart3} title="No data" description="There is no data for this report yet." />;
  }

  return (
    <Table>
      <Thead>
        <Tr>
          {report.columns.map((c) => (
            <Th key={c.key}>{c.label}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {report.rows.map((row, i) => (
          <Tr key={i}>
            {report.columns.map((c) => (
              <Td key={c.key}>{String(row[c.key] ?? "-")}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

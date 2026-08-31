import { NextResponse } from "next/server";
import { getReportData, REPORT_TYPES } from "@/lib/data/reports";
import { toCsv } from "@/lib/utils/csv";
import { requireSessionUser } from "@/lib/auth/get-session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reportType: string }> }
) {
  await requireSessionUser();
  const { reportType } = await params;
  const meta = REPORT_TYPES.find((r) => r.id === reportType);
  if (!meta) {
    return NextResponse.json({ error: "Unknown report" }, { status: 404 });
  }

  const report = await getReportData(reportType);
  const rows = report.rows.map((row) => {
    const mapped: Record<string, unknown> = {};
    for (const col of report.columns) mapped[col.label] = row[col.key];
    return mapped;
  });
  const csv = toCsv(rows, report.columns.map((c) => c.label));

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${reportType}.csv"`,
    },
  });
}

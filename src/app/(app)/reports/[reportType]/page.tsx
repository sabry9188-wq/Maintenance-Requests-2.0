import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getReportData, REPORT_TYPES } from "@/lib/data/reports";
import { ReportTable } from "@/components/reports/report-table";
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { Card, CardContent } from "@/components/ui/card";

export default async function ReportDetailPage({ params }: { params: Promise<{ reportType: string }> }) {
  const { reportType } = await params;
  const meta = REPORT_TYPES.find((r) => r.id === reportType);
  if (!meta) notFound();

  const report = await getReportData(reportType);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/reports" className="mb-1 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800">
            <ArrowLeft className="h-3.5 w-3.5" /> All Reports
          </Link>
          <h1 className="text-xl font-semibold text-neutral-900">{meta.title}</h1>
          <p className="text-sm text-neutral-500">{meta.description}</p>
        </div>
        <ExportCsvButton reportId={reportType} />
      </div>
      <Card>
        <CardContent className="!p-0">
          <ReportTable report={report} />
        </CardContent>
      </Card>
    </div>
  );
}

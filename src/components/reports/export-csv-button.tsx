"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportCsvButton({ reportId }: { reportId: string }) {
  return (
    <a href={`/api/reports/${reportId}/export`}>
      <Button variant="outline" size="sm">
        <Download className="h-3.5 w-3.5" /> Export CSV
      </Button>
    </a>
  );
}

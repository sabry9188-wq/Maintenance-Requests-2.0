import Link from "next/link";
import { REPORT_TYPES } from "@/lib/data/reports";
import { Card, CardContent } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Reports</h1>
        <p className="text-sm text-neutral-500">Maintenance performance and cost reporting.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_TYPES.map((r) => (
          <Link key={r.id} href={`/reports/${r.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent>
                <p className="font-medium text-neutral-900">{r.title}</p>
                <p className="mt-1 text-sm text-neutral-500">{r.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

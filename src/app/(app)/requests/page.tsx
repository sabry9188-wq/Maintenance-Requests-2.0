import { listRequests } from "@/lib/data/requests";
import { getStations } from "@/lib/data/stations";
import { getDepartments } from "@/lib/data/departments";
import { getCategories } from "@/lib/data/categories";
import { RequestFilters } from "@/components/requests/request-filters";
import { RequestListTable } from "@/components/requests/request-list-table";
import { Pagination } from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { RequestListItem } from "@/lib/types/domain";
import type { PriorityLevel, RequestStatus } from "@/lib/types/database.types";

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const [result, stations, departments, categories] = await Promise.all([
    listRequests({
      search: params.search,
      station_id: params.station ? [params.station] : undefined,
      department_id: params.department ? [params.department] : undefined,
      status: params.status ? [params.status as RequestStatus] : undefined,
      priority: params.priority ? [params.priority as PriorityLevel] : undefined,
      category_id: params.category ? [params.category] : undefined,
      date_from: params.date_from,
      date_to: params.date_to,
      page,
      pageSize: 20,
    }),
    getStations(),
    getDepartments(),
    getCategories(),
  ]);

  const exportParams = new URLSearchParams();
  if (params.search) exportParams.set("search", params.search);
  if (params.station) exportParams.set("station", params.station);
  if (params.department) exportParams.set("department", params.department);
  if (params.status) exportParams.set("status", params.status);
  if (params.priority) exportParams.set("priority", params.priority);
  if (params.category) exportParams.set("category", params.category);
  if (params.date_from) exportParams.set("date_from", params.date_from);
  if (params.date_to) exportParams.set("date_to", params.date_to);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Maintenance Requests</h1>
          <p className="text-sm text-neutral-500">Search, filter and track all maintenance requests.</p>
        </div>
        <a href={`/api/requests/export?${exportParams.toString()}`}>
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </a>
      </div>

      <RequestFilters options={{ stations, departments, categories }} />

      <Card>
        <RequestListTable requests={result.data as unknown as RequestListItem[]} />
        <Pagination page={result.page} pageSize={result.pageSize} total={result.count} />
      </Card>
    </div>
  );
}

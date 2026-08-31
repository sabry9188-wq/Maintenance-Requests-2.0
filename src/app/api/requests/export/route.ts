import { NextResponse } from "next/server";
import { listRequests } from "@/lib/data/requests";
import { toCsv } from "@/lib/utils/csv";
import { requireSessionUser } from "@/lib/auth/get-session";
import type { PriorityLevel, RequestStatus } from "@/lib/types/database.types";

export async function GET(request: Request) {
  await requireSessionUser();
  const { searchParams } = new URL(request.url);

  const result = await listRequests({
    search: searchParams.get("search") ?? undefined,
    station_id: searchParams.get("station") ? [searchParams.get("station")!] : undefined,
    department_id: searchParams.get("department") ? [searchParams.get("department")!] : undefined,
    status: searchParams.get("status") ? [searchParams.get("status") as RequestStatus] : undefined,
    priority: searchParams.get("priority") ? [searchParams.get("priority") as PriorityLevel] : undefined,
    category_id: searchParams.get("category") ? [searchParams.get("category")!] : undefined,
    date_from: searchParams.get("date_from") ?? undefined,
    date_to: searchParams.get("date_to") ?? undefined,
    page: 1,
    pageSize: 5000,
  });

  const rows = result.data.map((r) => ({
    "Request No.": r.request_number,
    Station: r.station?.name,
    Department: r.department?.name,
    Category: r.category?.name,
    "Problem Type": r.problem_type?.name,
    Priority: r.priority,
    Status: r.status,
    "Problem Title": r.problem_title,
    Requester: r.requester?.full_name,
    Technician: r.assigned_technician?.full_name,
    "Submitted At": r.created_at,
  }));
  const csv = toCsv(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="maintenance-requests.csv"`,
    },
  });
}

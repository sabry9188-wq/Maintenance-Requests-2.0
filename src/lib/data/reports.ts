import { createClient } from "@/lib/supabase/server";
import { getSlaConfigMap } from "./sla-config";
import { isOverdue } from "@/lib/utils/sla";
import { OPEN_STATUSES } from "@/lib/types/domain";
import type { PriorityLevel, RequestStatus } from "@/lib/types/database.types";

export interface ReportColumn {
  key: string;
  label: string;
}
export interface ReportResult {
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
}

export const REPORT_TYPES: { id: string; title: string; description: string }[] = [
  { id: "by-station", title: "Requests by Station", description: "Request volume grouped by station." },
  { id: "by-department", title: "Requests by Department", description: "Request volume grouped by department." },
  { id: "by-category", title: "Requests by Category", description: "Request volume grouped by maintenance category." },
  { id: "by-priority", title: "Requests by Priority", description: "Request volume grouped by priority level." },
  { id: "by-status", title: "Requests by Status", description: "Request volume grouped by current status." },
  { id: "by-month", title: "Monthly Maintenance Requests", description: "Requests submitted per month." },
  { id: "open-requests", title: "Open Requests", description: "All requests that are not yet closed." },
  { id: "overdue-requests", title: "Overdue Requests", description: "Open requests that have passed their SLA response target." },
  { id: "avg-response-time", title: "Average Response Time", description: "Average time from submission to acknowledgement, by priority." },
  { id: "avg-resolution-time", title: "Average Resolution Time", description: "Average time from submission to closure, by priority." },
  { id: "maintenance-cost", title: "Maintenance Cost", description: "Total parts/material cost per request." },
  { id: "parts-used", title: "Parts Used", description: "All parts and materials logged against requests." },
  { id: "technician-workload", title: "Technician Workload", description: "Number of requests assigned per technician." },
  { id: "repeated-problems", title: "Repeated Problems", description: "Most frequently reported problem types." },
  { id: "equipment-breakdown", title: "Equipment Breakdown History", description: "Breakdown count and cost per asset." },
];

interface ReportRequestRow {
  id: string;
  request_number: string;
  status: RequestStatus;
  priority: PriorityLevel;
  created_at: string;
  acknowledged_at: string | null;
  closed_at: string | null;
  assigned_technician_id: string | null;
  category_id: string;
  asset_id: string | null;
  station: { name: string } | null;
  department: { name: string } | null;
  category: { name: string } | null;
  problem_type: { name: string } | null;
  technician: { full_name: string } | null;
}

async function baseRequests(): Promise<ReportRequestRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance_requests")
    .select(
      "id, request_number, status, priority, created_at, acknowledged_at, closed_at, assigned_technician_id, category_id, asset_id, " +
        "station:stations(name), department:departments(name), category:maintenance_categories(name), " +
        "problem_type:maintenance_problem_types(name), technician:profiles!maintenance_requests_assigned_technician_id_fkey(full_name)"
    );
  if (error) throw error;
  return (data ?? []) as unknown as ReportRequestRow[];
}

function groupCount<T>(rows: T[], keyFn: (row: T) => string) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = keyFn(row) || "Unspecified";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getReportData(reportId: string): Promise<ReportResult> {
  const requests = await baseRequests();

  switch (reportId) {
    case "by-station": {
      const rows = groupCount(requests, (r) => (r.station as { name: string } | null)?.name ?? "");
      return { columns: [{ key: "label", label: "Station" }, { key: "count", label: "Requests" }], rows };
    }
    case "by-department": {
      const rows = groupCount(requests, (r) => (r.department as { name: string } | null)?.name ?? "");
      return { columns: [{ key: "label", label: "Department" }, { key: "count", label: "Requests" }], rows };
    }
    case "by-category": {
      const rows = groupCount(requests, (r) => (r.category as { name: string } | null)?.name ?? "");
      return { columns: [{ key: "label", label: "Category" }, { key: "count", label: "Requests" }], rows };
    }
    case "by-priority": {
      const rows = groupCount(requests, (r) => r.priority);
      return { columns: [{ key: "label", label: "Priority" }, { key: "count", label: "Requests" }], rows };
    }
    case "by-status": {
      const rows = groupCount(requests, (r) => r.status);
      return { columns: [{ key: "label", label: "Status" }, { key: "count", label: "Requests" }], rows };
    }
    case "by-month": {
      const rows = groupCount(requests, (r) =>
        new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" })
      ).sort((a, b) => (a.label > b.label ? 1 : -1));
      return { columns: [{ key: "label", label: "Month" }, { key: "count", label: "Requests" }], rows };
    }
    case "open-requests": {
      const rows = requests
        .filter((r) => OPEN_STATUSES.includes(r.status))
        .map((r) => ({
          request_number: r.request_number,
          station: (r.station as { name: string } | null)?.name,
          status: r.status,
          priority: r.priority,
          created_at: r.created_at,
        }));
      return {
        columns: [
          { key: "request_number", label: "Request No." },
          { key: "station", label: "Station" },
          { key: "status", label: "Status" },
          { key: "priority", label: "Priority" },
          { key: "created_at", label: "Submitted" },
        ],
        rows,
      };
    }
    case "overdue-requests": {
      const slaConfig = await getSlaConfigMap();
      const rows = requests
        .filter((r) => OPEN_STATUSES.includes(r.status) && isOverdue(r.priority, r.created_at, r.acknowledged_at, slaConfig))
        .map((r) => ({
          request_number: r.request_number,
          station: (r.station as { name: string } | null)?.name,
          priority: r.priority,
          status: r.status,
          created_at: r.created_at,
        }));
      return {
        columns: [
          { key: "request_number", label: "Request No." },
          { key: "station", label: "Station" },
          { key: "priority", label: "Priority" },
          { key: "status", label: "Status" },
          { key: "created_at", label: "Submitted" },
        ],
        rows,
      };
    }
    case "avg-response-time": {
      const byPriority = new Map<string, number[]>();
      for (const r of requests) {
        if (!r.acknowledged_at) continue;
        const minutes = (new Date(r.acknowledged_at).getTime() - new Date(r.created_at).getTime()) / 60000;
        byPriority.set(r.priority, [...(byPriority.get(r.priority) ?? []), minutes]);
      }
      const rows = Array.from(byPriority.entries()).map(([priority, values]) => ({
        priority,
        avg_minutes: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
        sample_size: values.length,
      }));
      return {
        columns: [
          { key: "priority", label: "Priority" },
          { key: "avg_minutes", label: "Avg Response (minutes)" },
          { key: "sample_size", label: "Sample Size" },
        ],
        rows,
      };
    }
    case "avg-resolution-time": {
      const byPriority = new Map<string, number[]>();
      for (const r of requests) {
        if (!r.closed_at) continue;
        const minutes = (new Date(r.closed_at).getTime() - new Date(r.created_at).getTime()) / 60000;
        byPriority.set(r.priority, [...(byPriority.get(r.priority) ?? []), minutes]);
      }
      const rows = Array.from(byPriority.entries()).map(([priority, values]) => ({
        priority,
        avg_hours: Math.round((values.reduce((a, b) => a + b, 0) / values.length / 60) * 10) / 10,
        sample_size: values.length,
      }));
      return {
        columns: [
          { key: "priority", label: "Priority" },
          { key: "avg_hours", label: "Avg Resolution (hours)" },
          { key: "sample_size", label: "Sample Size" },
        ],
        rows,
      };
    }
    case "maintenance-cost": {
      const supabase = await createClient();
      const { data: parts, error } = await supabase
        .from("maintenance_request_parts")
        .select("request_id, total_cost, maintenance_requests(request_number)");
      if (error) throw error;
      const byRequest = new Map<string, { request_number: string; total: number }>();
      for (const p of parts) {
        const reqNum = (p.maintenance_requests as unknown as { request_number: string } | null)?.request_number ?? "-";
        const existing = byRequest.get(p.request_id) ?? { request_number: reqNum, total: 0 };
        existing.total += p.total_cost ?? 0;
        byRequest.set(p.request_id, existing);
      }
      const rows = Array.from(byRequest.values())
        .map((v) => ({ request_number: v.request_number, total_cost: v.total }))
        .sort((a, b) => b.total_cost - a.total_cost);
      return {
        columns: [
          { key: "request_number", label: "Request No." },
          { key: "total_cost", label: "Total Cost" },
        ],
        rows,
      };
    }
    case "parts-used": {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("maintenance_request_parts")
        .select("part_name, part_number, quantity, unit, unit_cost, total_cost, maintenance_requests(request_number)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = data.map((p) => ({
        request_number: (p.maintenance_requests as unknown as { request_number: string } | null)?.request_number,
        part_name: p.part_name,
        part_number: p.part_number,
        quantity: p.quantity,
        unit: p.unit,
        unit_cost: p.unit_cost,
        total_cost: p.total_cost,
      }));
      return {
        columns: [
          { key: "request_number", label: "Request No." },
          { key: "part_name", label: "Part Name" },
          { key: "part_number", label: "Part No." },
          { key: "quantity", label: "Qty" },
          { key: "unit", label: "Unit" },
          { key: "unit_cost", label: "Unit Cost" },
          { key: "total_cost", label: "Total Cost" },
        ],
        rows,
      };
    }
    case "technician-workload": {
      const rows = groupCount(
        requests.filter((r) => r.technician),
        (r) => (r.technician as { full_name: string } | null)?.full_name ?? "Unassigned"
      );
      return { columns: [{ key: "label", label: "Technician" }, { key: "count", label: "Assigned Requests" }], rows };
    }
    case "repeated-problems": {
      const rows = groupCount(requests, (r) => (r.problem_type as { name: string } | null)?.name ?? "");
      return { columns: [{ key: "label", label: "Problem Type" }, { key: "count", label: "Occurrences" }], rows };
    }
    case "equipment-breakdown": {
      const supabase = await createClient();
      const { data: assets, error } = await supabase.from("assets").select("id, asset_code, name");
      if (error) throw error;
      const rows = assets.map((a) => {
        const assetRequests = requests.filter((r) => r.asset_id === a.id);
        return {
          asset_code: a.asset_code,
          name: a.name,
          total_breakdowns: assetRequests.length,
          last_breakdown: assetRequests[0]?.created_at ?? null,
        };
      });
      return {
        columns: [
          { key: "asset_code", label: "Asset Code" },
          { key: "name", label: "Asset Name" },
          { key: "total_breakdowns", label: "Total Breakdowns" },
          { key: "last_breakdown", label: "Last Breakdown" },
        ],
        rows: rows.filter((r) => r.total_breakdowns > 0).sort((a, b) => b.total_breakdowns - a.total_breakdowns),
      };
    }
    default:
      return { columns: [], rows: [] };
  }
}

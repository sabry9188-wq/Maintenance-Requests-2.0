import { createClient } from "@/lib/supabase/server";
import type { RequestStatus, PriorityLevel } from "@/lib/types/database.types";

const LIST_SELECT = `
  *,
  station:stations(id, code, name),
  department:departments(id, name),
  category:maintenance_categories(id, name),
  problem_type:maintenance_problem_types(id, name),
  assigned_technician:profiles!maintenance_requests_assigned_technician_id_fkey(id, full_name),
  requester:profiles!maintenance_requests_requested_by_fkey(id, full_name)
`;

const DETAIL_SELECT = `
  ${LIST_SELECT},
  area:areas(id, name),
  asset:assets(id, asset_code, name)
`;

export interface RequestFilters {
  search?: string;
  station_id?: string[];
  department_id?: string[];
  status?: RequestStatus[];
  priority?: PriorityLevel[];
  category_id?: string[];
  problem_type_id?: string[];
  technician_id?: string[];
  area_id?: string[];
  asset_id?: string;
  date_from?: string;
  date_to?: string;
  requested_by?: string;
  page?: number;
  pageSize?: number;
}

export async function listRequests(filters: RequestFilters = {}) {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("maintenance_requests").select(LIST_SELECT, { count: "exact" });

  if (filters.search) {
    const term = filters.search.trim();
    query = query.or(
      `request_number.ilike.%${term}%,problem_title.ilike.%${term}%,problem_description.ilike.%${term}%`
    );
  }
  if (filters.station_id?.length) query = query.in("station_id", filters.station_id);
  if (filters.department_id?.length) query = query.in("department_id", filters.department_id);
  if (filters.status?.length) query = query.in("status", filters.status);
  if (filters.priority?.length) query = query.in("priority", filters.priority);
  if (filters.category_id?.length) query = query.in("category_id", filters.category_id);
  if (filters.problem_type_id?.length) query = query.in("problem_type_id", filters.problem_type_id);
  if (filters.technician_id?.length) query = query.in("assigned_technician_id", filters.technician_id);
  if (filters.area_id?.length) query = query.in("area_id", filters.area_id);
  if (filters.asset_id) query = query.eq("asset_id", filters.asset_id);
  if (filters.requested_by) query = query.eq("requested_by", filters.requested_by);
  if (filters.date_from) query = query.gte("created_at", filters.date_from);
  if (filters.date_to) query = query.lte("created_at", filters.date_to);

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0, page, pageSize };
}

export async function getRequestById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance_requests")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getRequestHistory(requestId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance_request_history")
    .select("*, actor:profiles(id, full_name)")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getRequestUpdates(requestId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance_request_updates")
    .select("*, technician:profiles(id, full_name)")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getRequestParts(requestId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance_request_parts")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getRequestAttachments(requestId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance_request_attachments")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getRequestFeedback(requestId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("request_id", requestId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getDashboardCounts(scopeToUserId?: string) {
  const supabase = await createClient();
  let query = supabase.from("maintenance_requests").select("status", { count: "exact", head: false });
  if (scopeToUserId) query = query.eq("requested_by", scopeToUserId);
  const { data, error } = await query;
  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return counts;
}

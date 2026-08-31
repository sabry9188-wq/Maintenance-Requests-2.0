import { createClient } from "@/lib/supabase/server";

export interface AuditLogFilters {
  request_number?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  pageSize?: number;
}

export async function listAuditLogs(filters: AuditLogFilters = {}) {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("audit_logs")
    .select("*, user:profiles(id, full_name)", { count: "exact" });

  if (filters.request_number) {
    query = query.ilike("request_number", `%${filters.request_number}%`);
  }
  if (filters.user_id) query = query.eq("user_id", filters.user_id);
  if (filters.date_from) query = query.gte("created_at", filters.date_from);
  if (filters.date_to) query = query.lte("created_at", filters.date_to);

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0, page, pageSize };
}

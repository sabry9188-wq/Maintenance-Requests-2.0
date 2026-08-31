import { createClient } from "@/lib/supabase/server";

export async function getAssets(stationId?: string, includeInactive = false) {
  const supabase = await createClient();
  let query = supabase
    .from("assets")
    .select("*, station:stations(id, code, name)")
    .order("asset_code");
  if (stationId) query = query.eq("station_id", stationId);
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getAssetById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .select("*, station:stations(id, code, name), department:departments(id, name), area:areas(id, name)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getAssetBreakdownHistory(assetId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance_requests")
    .select(
      "id, request_number, status, priority, problem_title, created_at, closed_at, maintenance_request_parts(total_cost)"
    )
    .eq("asset_id", assetId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const totalBreakdowns = data.length;
  const lastBreakdown = data[0]?.created_at ?? null;
  const totalCost = data.reduce(
    (sum, r) =>
      sum +
      (r.maintenance_request_parts as { total_cost: number | null }[]).reduce(
        (s, p) => s + (p.total_cost ?? 0),
        0
      ),
    0
  );
  const repairTimes = data
    .filter((r) => r.closed_at)
    .map((r) => (new Date(r.closed_at!).getTime() - new Date(r.created_at).getTime()) / 3600000);
  const avgRepairHours =
    repairTimes.length > 0 ? repairTimes.reduce((a, b) => a + b, 0) / repairTimes.length : null;

  return {
    requests: data,
    totalBreakdowns,
    lastBreakdown,
    totalCost,
    avgRepairHours,
  };
}

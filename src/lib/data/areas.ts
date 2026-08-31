import { createClient } from "@/lib/supabase/server";

export async function getAreas(stationId?: string, includeInactive = false) {
  const supabase = await createClient();
  let query = supabase.from("areas").select("*").order("name");
  if (stationId) query = query.eq("station_id", stationId);
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

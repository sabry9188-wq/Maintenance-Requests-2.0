import { createClient } from "@/lib/supabase/server";

export async function getStations(includeInactive = false) {
  const supabase = await createClient();
  let query = supabase.from("stations").select("*").order("code");
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

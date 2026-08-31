import { createClient } from "@/lib/supabase/server";

export async function listPreventiveMaintenance() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("preventive_maintenance")
    .select("*, asset:assets(id, asset_code, name, station_id), responsible:profiles(id, full_name)")
    .order("next_due_date");
  if (error) throw error;
  return data;
}

export async function getPreventiveMaintenanceById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("preventive_maintenance")
    .select("*, asset:assets(id, asset_code, name), responsible:profiles(id, full_name)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getPreventiveMaintenanceTasks(pmId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("preventive_maintenance_tasks")
    .select("*, completed_by_profile:profiles(id, full_name)")
    .eq("pm_id", pmId)
    .order("due_date", { ascending: false });
  if (error) throw error;
  return data;
}

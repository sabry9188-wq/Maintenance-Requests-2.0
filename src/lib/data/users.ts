import { createClient } from "@/lib/supabase/server";

export async function getUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*, station:stations(id, name), department:departments(id, name)")
    .order("full_name");
  if (error) throw error;
  return data;
}

export async function getTechnicians() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["ENGINEER", "ENGINEERING_MANAGER"])
    .eq("is_active", true)
    .order("full_name");
  if (error) throw error;
  return data;
}

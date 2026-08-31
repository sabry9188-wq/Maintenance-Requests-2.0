import { createClient } from "@/lib/supabase/server";

export async function getDepartments(includeInactive = false) {
  const supabase = await createClient();
  let query = supabase.from("departments").select("*").order("name");
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

import { createClient } from "@/lib/supabase/server";

export async function getCategories(includeInactive = false) {
  const supabase = await createClient();
  let query = supabase.from("maintenance_categories").select("*").order("sort_order");
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getCategoriesWithProblemTypes(includeInactive = false) {
  const supabase = await createClient();
  let query = supabase
    .from("maintenance_categories")
    .select("*, maintenance_problem_types(*)")
    .order("sort_order");
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

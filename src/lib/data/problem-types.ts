import { createClient } from "@/lib/supabase/server";

export async function getProblemTypes(categoryId?: string, includeInactive = false) {
  const supabase = await createClient();
  let query = supabase.from("maintenance_problem_types").select("*").order("sort_order");
  if (categoryId) query = query.eq("category_id", categoryId);
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

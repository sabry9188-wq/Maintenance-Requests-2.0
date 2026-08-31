import { createClient } from "@/lib/supabase/server";
import type { SlaConfigMap } from "@/lib/utils/sla";

export async function getSlaConfig() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("sla_config").select("*").order("priority");
  if (error) throw error;
  return data;
}

export async function getSlaConfigMap(): Promise<SlaConfigMap> {
  const rows = await getSlaConfig();
  return Object.fromEntries(rows.map((r) => [r.priority, r.response_time_minutes]));
}

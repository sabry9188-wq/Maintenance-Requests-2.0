import { requireAdmin } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { getStations } from "@/lib/data/stations";
import { AreaManager } from "@/components/admin/area-manager";
import { Card } from "@/components/ui/card";

export default async function AreasSettingsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const [{ data: areas }, stations] = await Promise.all([
    supabase.from("areas").select("*, station:stations(name)").order("name"),
    getStations(true),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Areas</h1>
        <p className="text-sm text-neutral-500">Manage areas/locations within each station.</p>
      </div>
      <Card>
        <AreaManager areas={areas ?? []} stations={stations} />
      </Card>
    </div>
  );
}

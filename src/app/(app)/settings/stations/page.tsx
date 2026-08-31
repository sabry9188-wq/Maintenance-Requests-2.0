import { requireAdmin } from "@/lib/auth/require-role";
import { getStations } from "@/lib/data/stations";
import { StationManager } from "@/components/admin/station-manager";
import { Card } from "@/components/ui/card";

export default async function StationsSettingsPage() {
  await requireAdmin();
  const stations = await getStations(true);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Stations</h1>
        <p className="text-sm text-neutral-500">Manage Station 01-07 and add new stations as the organization grows.</p>
      </div>
      <Card>
        <StationManager stations={stations} />
      </Card>
    </div>
  );
}

import { requireRole } from "@/lib/auth/require-role";
import { getStations } from "@/lib/data/stations";
import { getDepartments } from "@/lib/data/departments";
import { getAreas } from "@/lib/data/areas";
import { AssetForm } from "@/components/assets/asset-form";

export default async function NewAssetPage() {
  await requireRole(["ADMIN", "ENGINEERING_MANAGER"]);
  const [stations, departments, areas] = await Promise.all([getStations(), getDepartments(), getAreas()]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold text-neutral-900">Add Asset</h1>
      <AssetForm stations={stations} departments={departments} areas={areas} />
    </div>
  );
}

import { requireRole } from "@/lib/auth/require-role";
import { getStations } from "@/lib/data/stations";
import { getDepartments } from "@/lib/data/departments";
import { getAreas } from "@/lib/data/areas";
import { getAssets } from "@/lib/data/assets";
import { getCategories } from "@/lib/data/categories";
import { getProblemTypes } from "@/lib/data/problem-types";
import { RequestForm } from "@/components/requests/request-form";

export default async function NewRequestPage() {
  const session = await requireRole(["STATION_USER", "ENGINEERING_MANAGER", "ADMIN"]);

  const [stations, departments, areas, assets, categories, problemTypes] = await Promise.all([
    getStations(),
    getDepartments(),
    getAreas(),
    getAssets(),
    getCategories(),
    getProblemTypes(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Create Maintenance Request</h1>
        <p className="text-sm text-neutral-500">
          The request number is generated automatically once you submit.
        </p>
      </div>
      <RequestForm
        options={{
          stations,
          departments,
          areas,
          assets,
          categories,
          problemTypes,
          defaultStationId: session.profile.station_id,
          defaultDepartmentId: session.profile.department_id,
        }}
      />
    </div>
  );
}

import { requireAdmin } from "@/lib/auth/require-role";
import { getDepartments } from "@/lib/data/departments";
import { DepartmentManager } from "@/components/admin/department-manager";
import { Card } from "@/components/ui/card";

export default async function DepartmentsSettingsPage() {
  await requireAdmin();
  const departments = await getDepartments(true);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Departments</h1>
        <p className="text-sm text-neutral-500">Manage departments used across stations.</p>
      </div>
      <Card>
        <DepartmentManager departments={departments} />
      </Card>
    </div>
  );
}

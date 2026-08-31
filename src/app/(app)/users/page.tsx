import { requireAdmin } from "@/lib/auth/require-role";
import { getUsers } from "@/lib/data/users";
import { getStations } from "@/lib/data/stations";
import { getDepartments } from "@/lib/data/departments";
import { UserRoleManager } from "@/components/admin/user-role-manager";
import { Card } from "@/components/ui/card";

export default async function UsersPage() {
  await requireAdmin();
  const [users, stations, departments] = await Promise.all([getUsers(), getStations(true), getDepartments(true)]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Users</h1>
        <p className="text-sm text-neutral-500">
          Assign roles, stations and departments. New sign-ups start with no station/department until assigned here.
        </p>
      </div>
      <Card>
        <UserRoleManager users={users} stations={stations} departments={departments} />
      </Card>
    </div>
  );
}

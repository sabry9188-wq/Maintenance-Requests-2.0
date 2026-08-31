import { requireAdmin } from "@/lib/auth/require-role";
import { getUsers } from "@/lib/data/users";
import { getStations } from "@/lib/data/stations";
import { getDepartments } from "@/lib/data/departments";
import { UserRoleManager } from "@/components/admin/user-role-manager";
import { InviteUserForm } from "@/components/admin/invite-user-form";
import { Card } from "@/components/ui/card";

export default async function UsersPage() {
  await requireAdmin();
  const [users, stations, departments] = await Promise.all([getUsers(), getStations(true), getDepartments(true)]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Users</h1>
          <p className="text-sm text-neutral-500">
            Invite new users directly, or manage roles/stations/departments for people who registered themselves.
          </p>
        </div>
        <InviteUserForm stations={stations} departments={departments} />
      </div>
      <Card>
        <UserRoleManager users={users} stations={stations} departments={departments} />
      </Card>
    </div>
  );
}

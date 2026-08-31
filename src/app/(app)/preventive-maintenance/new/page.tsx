import { requireRole } from "@/lib/auth/require-role";
import { getAssets } from "@/lib/data/assets";
import { getUsers } from "@/lib/data/users";
import { PmTaskForm } from "@/components/pm/pm-task-form";

export default async function NewPmPage() {
  await requireRole(["ADMIN", "ENGINEERING_MANAGER"]);
  const [assets, users] = await Promise.all([getAssets(), getUsers()]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold text-neutral-900">New Preventive Maintenance Plan</h1>
      <PmTaskForm assets={assets} users={users} />
    </div>
  );
}

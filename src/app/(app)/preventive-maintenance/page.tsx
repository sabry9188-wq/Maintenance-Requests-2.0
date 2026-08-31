import Link from "next/link";
import { requireSessionUser } from "@/lib/auth/get-session";
import { listPreventiveMaintenance } from "@/lib/data/preventive-maintenance";
import { PmTaskList } from "@/components/pm/pm-task-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default async function PreventiveMaintenancePage() {
  const session = await requireSessionUser();
  const items = await listPreventiveMaintenance();
  const canManage = session.profile.role === "ADMIN" || session.profile.role === "ENGINEERING_MANAGER";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Preventive Maintenance</h1>
          <p className="text-sm text-neutral-500">Scheduled maintenance plans for critical equipment.</p>
        </div>
        {canManage && (
          <Link href="/preventive-maintenance/new">
            <Button>
              <PlusCircle className="h-4 w-4" /> New Plan
            </Button>
          </Link>
        )}
      </div>
      <Card>
        <PmTaskList items={items} />
      </Card>
    </div>
  );
}

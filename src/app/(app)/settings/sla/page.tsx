import { requireAdmin } from "@/lib/auth/require-role";
import { getSlaConfig } from "@/lib/data/sla-config";
import { SlaConfigManager } from "@/components/admin/sla-config-manager";
import { Card } from "@/components/ui/card";

export default async function SlaSettingsPage() {
  await requireAdmin();
  const config = await getSlaConfig();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">SLA / Response Time</h1>
        <p className="text-sm text-neutral-500">
          Configure how quickly Engineering should respond to each priority level. Requests that pass this
          window without being acknowledged are flagged as overdue on dashboards and reports.
        </p>
      </div>
      <Card>
        <SlaConfigManager config={config} />
      </Card>
    </div>
  );
}

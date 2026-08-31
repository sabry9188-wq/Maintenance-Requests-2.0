import { notFound } from "next/navigation";
import { getAssetById, getAssetBreakdownHistory } from "@/lib/data/assets";
import { BreakdownHistoryPanel } from "@/components/assets/breakdown-history-panel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let asset;
  try {
    asset = await getAssetById(id);
  } catch {
    notFound();
  }
  if (!asset) notFound();

  const history = await getAssetBreakdownHistory(id);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>
              {asset.asset_code} - {asset.name}
            </CardTitle>
            <Badge>{asset.criticality} criticality</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs uppercase text-neutral-400">Station</p>
              <p className="font-medium text-neutral-800">{asset.station?.name ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-neutral-400">Department</p>
              <p className="font-medium text-neutral-800">{asset.department?.name ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-neutral-400">Area</p>
              <p className="font-medium text-neutral-800">{asset.area?.name ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-neutral-400">Status</p>
              <p className="font-medium text-neutral-800">{asset.status.replace(/_/g, " ")}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-neutral-400">Manufacturer</p>
              <p className="font-medium text-neutral-800">{asset.manufacturer ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-neutral-400">Model</p>
              <p className="font-medium text-neutral-800">{asset.model ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-neutral-400">Serial Number</p>
              <p className="font-medium text-neutral-800">{asset.serial_number ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-neutral-400">Installation Date</p>
              <p className="font-medium text-neutral-800">{asset.installation_date ?? "-"}</p>
            </div>
          </div>
          {asset.notes && (
            <p className="mt-3 text-sm text-neutral-600">
              <span className="font-medium">Notes:</span> {asset.notes}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equipment Breakdown History</CardTitle>
        </CardHeader>
        <CardContent>
          <BreakdownHistoryPanel history={history} />
        </CardContent>
      </Card>
    </div>
  );
}

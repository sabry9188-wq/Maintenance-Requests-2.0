import Link from "next/link";
import { requireSessionUser } from "@/lib/auth/get-session";
import { getAssets } from "@/lib/data/assets";
import { AssetListTable } from "@/components/assets/asset-list-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default async function AssetsPage() {
  const session = await requireSessionUser();
  const assets = await getAssets();
  const canManage = session.profile.role === "ADMIN" || session.profile.role === "ENGINEERING_MANAGER";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Assets / Equipment Register</h1>
          <p className="text-sm text-neutral-500">Equipment linked to maintenance requests across all stations.</p>
        </div>
        {canManage && (
          <Link href="/assets/new">
            <Button>
              <PlusCircle className="h-4 w-4" /> Add Asset
            </Button>
          </Link>
        )}
      </div>
      <Card>
        <AssetListTable assets={assets} />
      </Card>
    </div>
  );
}

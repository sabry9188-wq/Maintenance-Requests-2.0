import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, PriorityBadge, Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils/format";
import type { RequestDetail } from "@/lib/types/domain";

export function RequestHeaderCard({ request }: { request: RequestDetail }) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold text-neutral-900">{request.request_number}</h1>
              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
              {request.safety_risk && <Badge color="red">Safety Risk</Badge>}
              {request.production_impact && <Badge color="amber">Production Impact</Badge>}
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              Submitted by {request.requester?.full_name} on {formatDateTime(request.created_at)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs uppercase text-neutral-400">Station</p>
            <p className="font-medium text-neutral-800">{request.station?.name ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-neutral-400">Department</p>
            <p className="font-medium text-neutral-800">{request.department?.name ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-neutral-400">Area</p>
            <p className="font-medium text-neutral-800">{request.area?.name ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-neutral-400">Equipment</p>
            <p className="font-medium text-neutral-800">{request.asset ? `${request.asset.asset_code} - ${request.asset.name}` : "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-neutral-400">Category</p>
            <p className="font-medium text-neutral-800">{request.category?.name ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-neutral-400">Problem Type</p>
            <p className="font-medium text-neutral-800">{request.problem_type?.name ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-neutral-400">Assigned Technician</p>
            <p className="font-medium text-neutral-800">{request.assigned_technician?.full_name ?? "Unassigned"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-neutral-400">Operational Status</p>
            <p className="font-medium text-neutral-800">{request.is_operational ?? "-"}</p>
          </div>
        </div>

        <div className="mt-4 border-t border-neutral-100 pt-4">
          <p className="text-xs uppercase text-neutral-400">Problem</p>
          <p className="mt-0.5 font-medium text-neutral-900">{request.problem_title}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">{request.problem_description}</p>
          {request.additional_comments && (
            <>
              <p className="mt-3 text-xs uppercase text-neutral-400">Additional Comments</p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-neutral-700">{request.additional_comments}</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

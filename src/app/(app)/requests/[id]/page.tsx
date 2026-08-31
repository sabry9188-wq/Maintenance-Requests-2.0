import { notFound } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/get-session";
import {
  getRequestById,
  getRequestHistory,
  getRequestUpdates,
  getRequestParts,
  getRequestAttachments,
  getRequestFeedback,
} from "@/lib/data/requests";
import { getAttachmentsWithUrls } from "@/lib/data/attachments";
import { getTechnicians } from "@/lib/data/users";
import { RequestHeaderCard } from "@/components/requests/request-header-card";
import { RequestTimeline } from "@/components/requests/request-timeline";
import { StatusActionBar } from "@/components/requests/status-action-bar";
import { PartsUsedTable } from "@/components/requests/parts-used-table";
import { AttachmentGallery } from "@/components/requests/attachment-gallery";
import { ConfirmationPanel } from "@/components/requests/confirmation-panel";
import { FeedbackForm } from "@/components/requests/feedback-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { StarRating } from "@/components/ui/star-rating";
import { formatDateTime, formatMinutesAsDuration } from "@/lib/utils/format";
import type { RequestDetail } from "@/lib/types/domain";

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSessionUser();

  let request;
  try {
    request = await getRequestById(id);
  } catch {
    notFound();
  }
  if (!request) notFound();

  const [history, updates, parts, rawAttachments, feedback, technicians] = await Promise.all([
    getRequestHistory(id),
    getRequestUpdates(id),
    getRequestParts(id),
    getRequestAttachments(id),
    getRequestFeedback(id),
    getTechnicians(),
  ]);
  const attachments = await getAttachmentsWithUrls(rawAttachments);

  const role = session.profile.role;
  const isOwnRequest = request.requested_by === session.id;
  const isStationScope =
    role === "STATION_USER" &&
    (isOwnRequest || request.station_id === session.profile.station_id);

  const completionReport = updates.find((u) => u.update_type === "COMPLETION_REPORT");
  const workUpdates = updates.filter((u) => u.update_type === "WORK_UPDATE");

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <RequestHeaderCard request={request as unknown as RequestDetail} />

      <StatusActionBar
        requestId={id}
        status={request.status}
        role={role}
        isOwnRequest={isOwnRequest}
        technicians={technicians}
      />

      {request.status === "PENDING_CONFIRMATION" && isStationScope && <ConfirmationPanel requestId={id} />}

      {request.status === "CLOSED" && isStationScope && !feedback && <FeedbackForm requestId={id} />}

      {feedback && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <StarRating value={feedback.rating} readOnly size={18} />
              <span className="text-sm text-neutral-600">Problem solved: {feedback.problem_solved}</span>
            </div>
            {feedback.comment && <p className="mt-2 text-sm text-neutral-700">{feedback.comment}</p>}
          </CardContent>
        </Card>
      )}

      <Tabs
        tabs={[
          {
            id: "timeline",
            label: "Timeline",
            content: (
              <Card>
                <CardContent>
                  <RequestTimeline history={history as never} />
                </CardContent>
              </Card>
            ),
          },
          {
            id: "updates",
            label: `Work Updates (${workUpdates.length})`,
            content: (
              <Card>
                <CardContent className="space-y-4">
                  {workUpdates.length === 0 && (
                    <p className="py-6 text-center text-sm text-neutral-400">No work updates yet.</p>
                  )}
                  {workUpdates.map((u) => (
                    <div key={u.id} className="border-b border-neutral-100 pb-3 last:border-0">
                      <p className="text-xs text-neutral-400">
                        {formatDateTime(u.created_at)} - {(u as { technician: { full_name: string } | null }).technician?.full_name}
                      </p>
                      {u.work_description && <p className="mt-1 text-sm text-neutral-800">{u.work_description}</p>}
                      {u.diagnosis && <p className="mt-1 text-sm text-neutral-600"><span className="font-medium">Diagnosis:</span> {u.diagnosis}</p>}
                      {u.action_taken && <p className="mt-1 text-sm text-neutral-600"><span className="font-medium">Action:</span> {u.action_taken}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ),
          },
          {
            id: "parts",
            label: `Parts (${parts.length})`,
            content: (
              <Card>
                <CardContent className="!p-0">
                  <PartsUsedTable parts={parts} />
                </CardContent>
              </Card>
            ),
          },
          {
            id: "completion",
            label: "Completion Report",
            content: (
              <Card>
                <CardContent>
                  {!completionReport ? (
                    <p className="py-6 text-center text-sm text-neutral-400">Not completed yet.</p>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Root Cause:</span> {completionReport.root_cause}</p>
                      <p><span className="font-medium">Problem Found:</span> {completionReport.problem_found}</p>
                      <p><span className="font-medium">Work Performed:</span> {completionReport.work_performed}</p>
                      <p><span className="font-medium">Downtime:</span> {formatMinutesAsDuration(completionReport.downtime_minutes)}</p>
                      <p><span className="font-medium">Labour Hours:</span> {completionReport.total_labour_hours ?? "-"}</p>
                      <p><span className="font-medium">External Contractor:</span> {completionReport.external_contractor_used ? completionReport.contractor_name || "Yes" : "No"}</p>
                      {completionReport.final_remarks && <p><span className="font-medium">Remarks:</span> {completionReport.final_remarks}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            ),
          },
          {
            id: "attachments",
            label: `Photos & Files (${attachments.length})`,
            content: (
              <Card>
                <CardContent>
                  <AttachmentGallery attachments={attachments} />
                </CardContent>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { AssignTechnicianDialog } from "./assign-technician-dialog";
import { WorkUpdateForm } from "./work-update-form";
import { CompletionReportForm } from "./completion-report-form";
import {
  acceptRequest,
  cancelRequest,
  changeStatus,
  rejectRequest,
  startWork,
} from "@/lib/actions/request-actions";
import type { RequestStatus, UserRole } from "@/lib/types/database.types";

interface Props {
  requestId: string;
  status: RequestStatus;
  role: UserRole;
  isOwnRequest: boolean;
  technicians: { id: string; full_name: string }[];
}

export function StatusActionBar({ requestId, status, role, isOwnRequest, technicians }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [assignOpen, setAssignOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);

  const isEngineering = role === "ENGINEERING_MANAGER" || role === "ENGINEER" || role === "ADMIN";
  const isManager = role === "ENGINEERING_MANAGER" || role === "ADMIN";

  function run(action: () => Promise<{ success: boolean; error?: string }>, successMessage: string) {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast.success(successMessage);
        router.refresh();
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  }

  function handleReject() {
    if (rejectReason.trim().length < 3) {
      setRejectError("Please provide a reason for rejecting this request.");
      return;
    }
    setRejectError(null);
    startTransition(async () => {
      const result = await rejectRequest(requestId, rejectReason);
      if (result.success) {
        toast.success("Request rejected.");
        setRejectOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  const buttons: React.ReactNode[] = [];

  if (isEngineering) {
    if (status === "SUBMITTED" && isManager) {
      buttons.push(
        <Button key="accept" disabled={isPending} onClick={() => run(() => acceptRequest(requestId), "Request accepted.")}>
          Accept
        </Button>
      );
      buttons.push(
        <Button key="reject" variant="danger" disabled={isPending} onClick={() => setRejectOpen(true)}>
          Reject
        </Button>
      );
    }
    if (status === "ACKNOWLEDGED" && isManager) {
      buttons.push(
        <Button key="assign" disabled={isPending} onClick={() => setAssignOpen(true)}>
          Assign Technician
        </Button>
      );
      buttons.push(
        <Button key="reject2" variant="danger" disabled={isPending} onClick={() => setRejectOpen(true)}>
          Reject
        </Button>
      );
    }
    if (status === "ASSIGNED" || status === "SCHEDULED") {
      buttons.push(
        <Button key="start" disabled={isPending} onClick={() => run(() => startWork(requestId), "Work started.")}>
          Start Work
        </Button>
      );
      if (isManager && status === "ASSIGNED") {
        buttons.push(
          <Button key="reassign" variant="outline" disabled={isPending} onClick={() => setAssignOpen(true)}>
            Reassign
          </Button>
        );
      }
    }
    if (status === "IN_PROGRESS") {
      buttons.push(
        <Button key="update" variant="outline" disabled={isPending} onClick={() => setUpdateOpen(true)}>
          Add Update
        </Button>
      );
      buttons.push(
        <Button
          key="waiting-parts"
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => changeStatus(requestId, "WAITING_FOR_PARTS"), "Marked waiting for parts.")}
        >
          Waiting for Parts
        </Button>
      );
      buttons.push(
        <Button
          key="hold"
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => changeStatus(requestId, "ON_HOLD"), "Request put on hold.")}
        >
          Put On Hold
        </Button>
      );
      buttons.push(
        <Button key="complete" disabled={isPending} onClick={() => setCompleteOpen(true)}>
          Complete
        </Button>
      );
    }
    if (status === "WAITING_FOR_PARTS" || status === "WAITING_FOR_EXTERNAL_SUPPORT" || status === "ON_HOLD") {
      buttons.push(
        <Button
          key="resume"
          disabled={isPending}
          onClick={() => run(() => changeStatus(requestId, "IN_PROGRESS"), "Work resumed.")}
        >
          Resume Work
        </Button>
      );
    }
    if (status === "REOPENED" && isManager) {
      buttons.push(
        <Button key="assign-reopen" disabled={isPending} onClick={() => setAssignOpen(true)}>
          Assign Technician
        </Button>
      );
      buttons.push(
        <Button
          key="start-reopen"
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => startWork(requestId), "Work started.")}
        >
          Start Work
        </Button>
      );
    }
  }

  if (isOwnRequest && (status === "SUBMITTED" || status === "RECEIVED" || status === "ACKNOWLEDGED")) {
    buttons.push(
      <Button
        key="cancel"
        variant="outline"
        disabled={isPending}
        onClick={() => run(() => cancelRequest(requestId), "Request cancelled.")}
      >
        Cancel Request
      </Button>
    );
  }

  if (buttons.length === 0) return null;

  return (
    <>
      <Card>
        <CardContent className="flex flex-wrap gap-2 !py-3">{buttons}</CardContent>
      </Card>

      <AssignTechnicianDialog
        requestId={requestId}
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        technicians={technicians}
      />
      <WorkUpdateForm requestId={requestId} open={updateOpen} onClose={() => setUpdateOpen(false)} />
      <CompletionReportForm requestId={requestId} open={completeOpen} onClose={() => setCompleteOpen(false)} />

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Request">
        <FieldGroup>
          <Label htmlFor="reject_reason">Reason for rejection</Label>
          <Textarea id="reject_reason" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          <FieldError>{rejectError ?? undefined}</FieldError>
        </FieldGroup>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={isPending}>
            Reject Request
          </Button>
        </div>
      </Dialog>
    </>
  );
}

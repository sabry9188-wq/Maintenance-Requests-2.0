"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { confirmWorkCompleted, reopenRequest } from "@/lib/actions/confirmation-actions";

export function ConfirmationPanel({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [showReopen, setShowReopen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await confirmWorkCompleted(requestId);
      if (result.success) {
        toast.success("Work confirmed. Request closed.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleReopen() {
    if (reason.trim().length < 5) {
      setError("Please explain why the request is being reopened.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await reopenRequest({ request_id: requestId, reopen_reason: reason });
      if (result.success) {
        toast.success("Request reopened. Engineering has been notified.");
        setShowReopen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card className="border-primary-200 bg-primary-50/40">
      <CardHeader>
        <CardTitle>Engineering has completed this maintenance request</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-neutral-600">
          Please review the work performed and confirm it resolves the problem, or reopen the request if it
          does not.
        </p>

        {!showReopen ? (
          <div className="flex flex-wrap gap-2">
            <Button disabled={isPending} onClick={handleConfirm}>
              Confirm Work Completed
            </Button>
            <Button variant="outline" disabled={isPending} onClick={() => setShowReopen(true)}>
              Reopen Request
            </Button>
          </div>
        ) : (
          <div>
            <FieldGroup>
              <Label htmlFor="reopen_reason">Reason for reopening</Label>
              <Textarea
                id="reopen_reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Pump is still leaking after repair."
              />
              <FieldError>{error ?? undefined}</FieldError>
            </FieldGroup>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowReopen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button onClick={handleReopen} disabled={isPending}>
                {isPending ? "Submitting..." : "Submit Reopen Request"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

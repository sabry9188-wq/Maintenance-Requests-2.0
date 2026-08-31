"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Input, Textarea, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { completionReportSchema, type CompletionReportInput } from "@/lib/validation/work-update-schema";
import { submitCompletionReport } from "@/lib/actions/update-actions";

export function CompletionReportForm({
  requestId,
  open,
  onClose,
}: {
  requestId: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CompletionReportInput>({
    resolver: zodResolver(completionReportSchema),
    defaultValues: { request_id: requestId, external_contractor_used: false },
  });
  const externalContractor = watch("external_contractor_used");

  async function onSubmit(values: CompletionReportInput) {
    setSubmitting(true);
    const result = await submitCompletionReport(values);
    setSubmitting(false);
    if (result.success) {
      toast.success("Work marked completed. The requesting station has been notified.");
      onClose();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Completion Report" className="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Label htmlFor="root_cause">Root Cause</Label>
          <Textarea id="root_cause" rows={2} {...register("root_cause")} />
          <FieldError>{errors.root_cause?.message}</FieldError>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="problem_found">Problem Found</Label>
          <Textarea id="problem_found" rows={2} {...register("problem_found")} />
          <FieldError>{errors.problem_found?.message}</FieldError>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="work_performed">Work Performed</Label>
          <Textarea id="work_performed" rows={2} {...register("work_performed")} />
          <FieldError>{errors.work_performed?.message}</FieldError>
        </FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup>
            <Label htmlFor="downtime_minutes">Downtime (minutes)</Label>
            <Input id="downtime_minutes" type="number" {...register("downtime_minutes")} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="total_labour_hours">Total Labour Hours</Label>
            <Input id="total_labour_hours" type="number" step="0.5" {...register("total_labour_hours")} />
          </FieldGroup>
        </div>
        <label className="mb-3 flex items-center gap-2 text-sm text-neutral-700">
          <Checkbox {...register("external_contractor_used")} /> External contractor used?
        </label>
        {externalContractor && (
          <FieldGroup>
            <Label htmlFor="contractor_name">Contractor Name</Label>
            <Input id="contractor_name" {...register("contractor_name")} />
          </FieldGroup>
        )}
        <FieldGroup>
          <Label htmlFor="final_remarks">Final Remarks</Label>
          <Textarea id="final_remarks" rows={2} {...register("final_remarks")} />
        </FieldGroup>

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Mark Work Completed"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

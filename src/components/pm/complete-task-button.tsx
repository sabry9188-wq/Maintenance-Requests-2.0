"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea, Label, FieldGroup } from "@/components/ui/input";
import { completePmTask } from "@/lib/actions/pm-actions";

export function CompleteTaskButton({ pmId, dueDate }: { pmId: string; dueDate: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleComplete() {
    startTransition(async () => {
      const result = await completePmTask(pmId, dueDate, notes);
      if (result.success) {
        toast.success("Task marked as done. Next due date updated.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Mark Done
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Complete Preventive Maintenance Task">
        <FieldGroup>
          <Label htmlFor="pm_notes">Notes (optional)</Label>
          <Textarea id="pm_notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FieldGroup>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleComplete} disabled={isPending}>
            {isPending ? "Saving..." : "Mark Done"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}

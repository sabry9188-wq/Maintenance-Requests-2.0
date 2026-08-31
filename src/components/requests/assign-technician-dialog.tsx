"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Select, Label, FieldGroup } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { assignTechnician } from "@/lib/actions/request-actions";

export function AssignTechnicianDialog({
  requestId,
  open,
  onClose,
  technicians,
}: {
  requestId: string;
  open: boolean;
  onClose: () => void;
  technicians: { id: string; full_name: string }[];
}) {
  const [technicianId, setTechnicianId] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!technicianId) return;
    startTransition(async () => {
      const result = await assignTechnician(requestId, technicianId);
      if (result.success) {
        toast.success("Technician assigned.");
        onClose();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onClose={onClose} title="Assign Technician">
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Label htmlFor="technician">Technician</Label>
          <Select id="technician" value={technicianId} onChange={(e) => setTechnicianId(e.target.value)} required>
            <option value="">Select technician</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || !technicianId}>
            {isPending ? "Assigning..." : "Assign"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

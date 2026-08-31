"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Input, Textarea, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { workUpdateSchema, type WorkUpdateInput } from "@/lib/validation/work-update-schema";
import { addWorkUpdate } from "@/lib/actions/update-actions";

export function WorkUpdateForm({
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
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkUpdateInput>({
    resolver: zodResolver(workUpdateSchema),
    defaultValues: { request_id: requestId, parts: [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "parts" });

  async function onSubmit(values: WorkUpdateInput) {
    setSubmitting(true);
    const result = await addWorkUpdate(values);
    setSubmitting(false);
    if (result.success) {
      toast.success("Work update added.");
      reset({ request_id: requestId, parts: [] });
      onClose();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Add Work Update" className="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Label htmlFor="work_description">Work Description</Label>
          <Textarea id="work_description" rows={3} {...register("work_description")} />
          <FieldError>{errors.work_description?.message}</FieldError>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="diagnosis">Diagnosis</Label>
          <Textarea id="diagnosis" rows={2} {...register("diagnosis")} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="action_taken">Action Taken</Label>
          <Textarea id="action_taken" rows={2} {...register("action_taken")} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="additional_notes">Additional Notes</Label>
          <Textarea id="additional_notes" rows={2} {...register("additional_notes")} />
        </FieldGroup>

        <div className="mb-2 flex items-center justify-between">
          <Label className="mb-0">Parts / Materials Used</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => append({ part_name: "", part_number: "", quantity: 1, unit: "", unit_cost: 0, remarks: "" })}
          >
            <Plus className="h-3.5 w-3.5" /> Add Part
          </Button>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="mb-2 grid grid-cols-12 gap-2 rounded-md border border-neutral-200 p-2">
            <Input className="col-span-4" placeholder="Part name" {...register(`parts.${index}.part_name`)} />
            <Input className="col-span-3" placeholder="Part No." {...register(`parts.${index}.part_number`)} />
            <Input className="col-span-2" type="number" step="0.01" placeholder="Qty" {...register(`parts.${index}.quantity`)} />
            <Input className="col-span-2" type="number" step="0.01" placeholder="Cost" {...register(`parts.${index}.unit_cost`)} />
            <button type="button" onClick={() => remove(index)} className="col-span-1 text-neutral-400 hover:text-primary-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Update"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

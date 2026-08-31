"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { pmSchema, type PmInput } from "@/lib/validation/pm-schema";
import { savePreventiveMaintenance } from "@/lib/actions/pm-actions";
import { Input, Select, Textarea, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PmTaskForm({
  pm,
  assets,
  users,
}: {
  pm?: PmInput;
  assets: { id: string; asset_code: string; name: string }[];
  users: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PmInput>({
    resolver: zodResolver(pmSchema),
    defaultValues: pm ?? { status: "ACTIVE" },
  });

  async function onSubmit(values: PmInput) {
    setSubmitting(true);
    const result = await savePreventiveMaintenance(values);
    setSubmitting(false);
    if (result.success) {
      toast.success("Preventive maintenance plan saved.");
      router.push("/preventive-maintenance");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldGroup>
            <Label htmlFor="asset_id">Asset</Label>
            <Select id="asset_id" {...register("asset_id")}>
              <option value="">Select asset</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.asset_code} - {a.name}
                </option>
              ))}
            </Select>
            <FieldError>{errors.asset_id?.message}</FieldError>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="maintenance_type">Maintenance Type</Label>
            <Input id="maintenance_type" placeholder="e.g. Generator service" {...register("maintenance_type")} />
            <FieldError>{errors.maintenance_type?.message}</FieldError>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="frequency_days">Frequency (days)</Label>
            <Input id="frequency_days" type="number" {...register("frequency_days")} />
            <FieldError>{errors.frequency_days?.message}</FieldError>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="next_due_date">Next Due Date</Label>
            <Input id="next_due_date" type="date" {...register("next_due_date")} />
            <FieldError>{errors.next_due_date?.message}</FieldError>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="responsible_person_id">Responsible Person</Label>
            <Select id="responsible_person_id" {...register("responsible_person_id")}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register("status")}>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="RETIRED">Retired</option>
            </Select>
          </FieldGroup>
          <FieldGroup className="sm:col-span-2">
            <Label htmlFor="notes">Notes / Checklist Summary</Label>
            <Textarea id="notes" rows={3} {...register("notes")} />
          </FieldGroup>
        </CardContent>
      </Card>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Plan"}
        </Button>
      </div>
    </form>
  );
}

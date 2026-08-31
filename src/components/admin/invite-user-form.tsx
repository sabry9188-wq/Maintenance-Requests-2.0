"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { inviteUserSchema, type InviteUserInput } from "@/lib/validation/admin-schema";
import { inviteUser } from "@/lib/actions/admin-actions";
import { Dialog } from "@/components/ui/dialog";
import { Input, Select, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ALL_ROLES, ROLE_LABELS } from "@/lib/auth/roles";
import type { StationRow, DepartmentRow } from "@/lib/types/database.types";

export function InviteUserForm({
  stations,
  departments,
}: {
  stations: StationRow[];
  departments: DepartmentRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { role: "STATION_USER" },
  });

  async function onSubmit(values: InviteUserInput) {
    setSubmitting(true);
    const result = await inviteUser(values);
    setSubmitting(false);
    if (result.success) {
      toast.success(`Invitation sent to ${values.email}.`);
      reset({ role: "STATION_USER" });
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" /> Invite User
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Invite User">
        <form onSubmit={handleSubmit(onSubmit)}>
          <p className="mb-4 text-sm text-neutral-500">
            They&apos;ll receive an email with a link to set their own password.
          </p>
          <FieldGroup>
            <Label htmlFor="invite_email">Email</Label>
            <Input id="invite_email" type="email" {...register("email")} />
            <FieldError>{errors.email?.message}</FieldError>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="invite_full_name">Full name (optional)</Label>
            <Input id="invite_full_name" {...register("full_name")} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="invite_role">Role</Label>
            <Select id="invite_role" {...register("role")}>
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="invite_station">Station</Label>
            <Select id="invite_station" {...register("station_id")}>
              <option value="">No station</option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="invite_department">Department</Label>
            <Select id="invite_department" {...register("department_id")}>
              <option value="">No department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Send Invite"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

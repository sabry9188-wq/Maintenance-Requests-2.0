"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { createUserSchema, type CreateUserInput } from "@/lib/validation/admin-schema";
import { createUserAccount } from "@/lib/actions/admin-actions";
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
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: "STATION_USER" },
  });

  async function onSubmit(values: CreateUserInput) {
    setSubmitting(true);
    const result = await createUserAccount(values);
    setSubmitting(false);
    if (result.success) {
      toast.success(`Account created for ${values.email}. Share the email and password with them directly.`);
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
        <UserPlus className="h-4 w-4" /> Add User
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add User">
        <form onSubmit={handleSubmit(onSubmit)}>
          <p className="mb-4 text-sm text-neutral-500">
            This creates a ready-to-use account immediately - no email confirmation needed. Share
            the email and password below with them directly (they can change their password later).
          </p>
          <FieldGroup>
            <Label htmlFor="create_full_name">Full name</Label>
            <Input id="create_full_name" {...register("full_name")} />
            <FieldError>{errors.full_name?.message}</FieldError>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="create_email">Email</Label>
            <Input id="create_email" type="email" {...register("email")} />
            <FieldError>{errors.email?.message}</FieldError>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="create_password">Password</Label>
            <Input id="create_password" type="text" placeholder="At least 8 characters" {...register("password")} />
            <FieldError>{errors.password?.message}</FieldError>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="create_role">Role</Label>
            <Select id="create_role" {...register("role")}>
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="create_station">Station</Label>
            <Select id="create_station" {...register("station_id")}>
              <option value="">No station</option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="create_department">Department</Label>
            <Select id="create_department" {...register("department_id")}>
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
              {submitting ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

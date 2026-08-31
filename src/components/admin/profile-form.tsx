"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { profileSchema, type ProfileInput } from "@/lib/validation/profile-schema";
import { updateOwnProfile } from "@/lib/actions/profile-actions";
import { Input, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProfileRow } from "@/lib/types/database.types";

export function ProfileForm({ profile }: { profile: ProfileRow }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name,
      phone: profile.phone ?? "",
      employee_id: profile.employee_id ?? "",
    },
  });

  async function onSubmit(values: ProfileInput) {
    setSubmitting(true);
    const result = await updateOwnProfile(values);
    setSubmitting(false);
    if (result.success) {
      toast.success("Profile updated.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Label htmlFor="full_name">Full Name</Label>
        <Input id="full_name" {...register("full_name")} />
        <FieldError>{errors.full_name?.message}</FieldError>
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...register("phone")} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="employee_id">Employee ID</Label>
        <Input id="employee_id" {...register("employee_id")} />
      </FieldGroup>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}

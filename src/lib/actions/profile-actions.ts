"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/get-session";
import { profileSchema, type ProfileInput } from "@/lib/validation/profile-schema";
import { toUserMessage } from "@/lib/utils/error-messages";
import type { ActionResult } from "./request-actions";

export async function updateOwnProfile(input: ProfileInput): Promise<ActionResult> {
  const session = await requireSessionUser();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
      employee_id: parsed.data.employee_id || null,
    })
    .eq("id", session.id);

  if (error) return { success: false, error: toUserMessage(error) };
  revalidatePath("/settings/profile");
  return { success: true, data: undefined };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import { assetSchema, type AssetInput } from "@/lib/validation/admin-schema";
import { toUserMessage } from "@/lib/utils/error-messages";
import type { ActionResult } from "./request-actions";

export async function saveAsset(input: AssetInput): Promise<ActionResult> {
  await requireRole(["ADMIN", "ENGINEERING_MANAGER"]);
  const parsed = assetSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  const { id, ...values } = parsed.data;
  const payload = {
    ...values,
    department_id: values.department_id || null,
    area_id: values.area_id || null,
    installation_date: values.installation_date || null,
  };
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("assets").update(payload).eq("id", id)
    : await supabase.from("assets").insert(payload);
  if (error) return { success: false, error: toUserMessage(error) };
  revalidatePath("/assets");
  return { success: true, data: undefined };
}

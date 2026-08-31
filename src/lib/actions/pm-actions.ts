"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import { requireSessionUser } from "@/lib/auth/get-session";
import { pmSchema, type PmInput } from "@/lib/validation/pm-schema";
import { toUserMessage } from "@/lib/utils/error-messages";
import type { ActionResult } from "./request-actions";

export async function savePreventiveMaintenance(input: PmInput): Promise<ActionResult> {
  await requireRole(["ADMIN", "ENGINEERING_MANAGER"]);
  const parsed = pmSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  const { id, ...values } = parsed.data;
  const payload = { ...values, responsible_person_id: values.responsible_person_id || null };
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("preventive_maintenance").update(payload).eq("id", id)
    : await supabase.from("preventive_maintenance").insert(payload);
  if (error) return { success: false, error: toUserMessage(error) };
  revalidatePath("/preventive-maintenance");
  return { success: true, data: undefined };
}

export async function completePmTask(pmId: string, dueDate: string, notes?: string): Promise<ActionResult> {
  const session = await requireSessionUser();
  const supabase = await createClient();

  try {
    const { error: taskError } = await supabase.from("preventive_maintenance_tasks").insert({
      pm_id: pmId,
      due_date: dueDate,
      status: "DONE",
      completed_at: new Date().toISOString(),
      completed_by: session.id,
      notes: notes || null,
    });
    if (taskError) throw taskError;

    const { data: pm, error: pmError } = await supabase
      .from("preventive_maintenance")
      .select("frequency_days")
      .eq("id", pmId)
      .single();
    if (pmError || !pm) throw pmError;

    const nextDate = new Date(dueDate);
    nextDate.setDate(nextDate.getDate() + pm.frequency_days);

    const { error: updateError } = await supabase
      .from("preventive_maintenance")
      .update({ next_due_date: nextDate.toISOString().slice(0, 10) })
      .eq("id", pmId);
    if (updateError) throw updateError;

    revalidatePath("/preventive-maintenance");
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toUserMessage(error) };
  }
}

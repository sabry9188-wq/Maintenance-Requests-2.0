"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/get-session";
import { workUpdateSchema, completionReportSchema, type WorkUpdateInput, type CompletionReportInput } from "@/lib/validation/work-update-schema";
import { toUserMessage } from "@/lib/utils/error-messages";
import { notificationTemplate } from "@/lib/notifications/templates";
import type { ActionResult } from "./request-actions";

export async function addWorkUpdate(input: WorkUpdateInput): Promise<ActionResult> {
  const session = await requireSessionUser();
  const parsed = workUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid update." };
  }
  const values = parsed.data;
  const supabase = await createClient();

  try {
    const { data: update, error } = await supabase
      .from("maintenance_request_updates")
      .insert({
        request_id: values.request_id,
        technician_id: session.id,
        update_type: "WORK_UPDATE",
        work_description: values.work_description,
        diagnosis: values.diagnosis || null,
        action_taken: values.action_taken || null,
        additional_notes: values.additional_notes || null,
      })
      .select("id")
      .single();
    if (error || !update) throw error;

    if (values.parts.length > 0) {
      const { error: partsError } = await supabase.from("maintenance_request_parts").insert(
        values.parts.map((p) => ({
          request_id: values.request_id,
          update_id: update.id,
          part_name: p.part_name,
          part_number: p.part_number || null,
          quantity: p.quantity,
          unit: p.unit || null,
          unit_cost: p.unit_cost ?? null,
          remarks: p.remarks || null,
        }))
      );
      if (partsError) throw partsError;
    }

    await supabase.from("maintenance_request_history").insert({
      request_id: values.request_id,
      actor_id: session.id,
      action: "WORK_UPDATE",
      comment: values.work_description,
    });

    revalidatePath(`/requests/${values.request_id}`);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toUserMessage(error) };
  }
}

export async function submitCompletionReport(input: CompletionReportInput): Promise<ActionResult> {
  const session = await requireSessionUser();
  const parsed = completionReportSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid completion report." };
  }
  const values = parsed.data;
  const supabase = await createClient();

  try {
    const { data: req, error: reqError } = await supabase
      .from("maintenance_requests")
      .select("id, request_number, requested_by")
      .eq("id", values.request_id)
      .single();
    if (reqError || !req) throw reqError;

    const { error: insertError } = await supabase.from("maintenance_request_updates").insert({
      request_id: values.request_id,
      technician_id: session.id,
      update_type: "COMPLETION_REPORT",
      work_status: "COMPLETED",
      root_cause: values.root_cause,
      problem_found: values.problem_found,
      work_performed: values.work_performed,
      downtime_minutes: values.downtime_minutes ?? null,
      total_labour_hours: values.total_labour_hours ?? null,
      external_contractor_used: values.external_contractor_used,
      contractor_name: values.contractor_name || null,
      final_remarks: values.final_remarks || null,
    });
    if (insertError) throw insertError;

    const now = new Date().toISOString();
    const { error: err1 } = await supabase
      .from("maintenance_requests")
      .update({ status: "COMPLETED", completed_at: now })
      .eq("id", values.request_id);
    if (err1) throw err1;

    const { error: err2 } = await supabase
      .from("maintenance_requests")
      .update({ status: "PENDING_CONFIRMATION" })
      .eq("id", values.request_id);
    if (err2) throw err2;

    const tmpl = notificationTemplate("CONFIRMATION_REQUIRED", req.request_number);
    await supabase.rpc("create_notification", {
      p_recipient_id: req.requested_by,
      p_request_id: values.request_id,
      p_type: "CONFIRMATION_REQUIRED",
      p_title: tmpl.title,
      p_body: tmpl.body,
    });

    revalidatePath(`/requests/${values.request_id}`);
    revalidatePath("/requests");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toUserMessage(error) };
  }
}

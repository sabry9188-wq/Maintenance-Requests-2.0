"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/get-session";
import { reopenSchema, type ReopenInput } from "@/lib/validation/feedback-schema";
import { toUserMessage } from "@/lib/utils/error-messages";
import { notificationTemplate } from "@/lib/notifications/templates";
import type { ActionResult } from "./request-actions";

export async function confirmWorkCompleted(requestId: string): Promise<ActionResult> {
  await requireSessionUser();
  const supabase = await createClient();

  try {
    const { data: req, error: reqError } = await supabase
      .from("maintenance_requests")
      .select("id, request_number, assigned_technician_id")
      .eq("id", requestId)
      .single();
    if (reqError || !req) throw reqError;

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("maintenance_requests")
      .update({ status: "CLOSED", confirmed_at: now, closed_at: now })
      .eq("id", requestId);
    if (error) throw error;

    if (req.assigned_technician_id) {
      const tmpl = notificationTemplate("CLOSED", req.request_number);
      await supabase.rpc("create_notification", {
        p_recipient_id: req.assigned_technician_id,
        p_request_id: requestId,
        p_type: "CLOSED",
        p_title: tmpl.title,
        p_body: tmpl.body,
      });
    }

    revalidatePath(`/requests/${requestId}`);
    revalidatePath("/requests");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toUserMessage(error) };
  }
}

export async function reopenRequest(input: ReopenInput): Promise<ActionResult> {
  await requireSessionUser();
  const parsed = reopenSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please provide a reason." };
  }
  const values = parsed.data;
  const supabase = await createClient();

  try {
    const { data: req, error: reqError } = await supabase
      .from("maintenance_requests")
      .select("id, request_number")
      .eq("id", values.request_id)
      .single();
    if (reqError || !req) throw reqError;

    const { error } = await supabase
      .from("maintenance_requests")
      .update({
        status: "REOPENED",
        reopen_reason: values.reopen_reason,
        reopened_at: new Date().toISOString(),
      })
      .eq("id", values.request_id);
    if (error) throw error;

    await supabase.from("maintenance_request_history").insert({
      request_id: values.request_id,
      action: "REOPENED",
      comment: values.reopen_reason,
    });

    const tmpl = notificationTemplate("REOPENED", req.request_number, values.reopen_reason);
    await supabase.rpc("notify_engineering_team", {
      p_request_id: values.request_id,
      p_type: "REOPENED",
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

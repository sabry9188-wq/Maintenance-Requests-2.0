"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/get-session";
import { createRequestSchema, type CreateRequestInput } from "@/lib/validation/request-schema";
import { toUserMessage } from "@/lib/utils/error-messages";
import { notificationTemplate } from "@/lib/notifications/templates";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createRequest(
  input: CreateRequestInput
): Promise<ActionResult<{ id: string; request_number: string }>> {
  const session = await requireSessionUser();
  const parsed = createRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid request data." };
  }
  const values = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("maintenance_requests")
    .insert({
      requested_by: session.id,
      station_id: values.station_id,
      department_id: values.department_id,
      area_id: values.area_id || null,
      asset_id: values.asset_id || null,
      category_id: values.category_id,
      problem_type_id: values.problem_type_id,
      priority: values.priority,
      problem_title: values.problem_title,
      problem_description: values.problem_description,
      problem_started_at: values.problem_started_at || null,
      is_operational: values.is_operational,
      operational_impact: values.operational_impact,
      safety_risk: values.safety_risk,
      production_impact: values.production_impact,
      additional_comments: values.additional_comments || null,
    })
    .select("id, request_number")
    .single();

  if (error || !data) {
    return { success: false, error: toUserMessage(error, "Unable to submit maintenance request. Please try again.") };
  }

  const tmpl = notificationTemplate("REQUEST_SUBMITTED", data.request_number);
  await supabase.rpc("notify_engineering_team", {
    p_request_id: data.id,
    p_type: "REQUEST_SUBMITTED",
    p_title: tmpl.title,
    p_body: tmpl.body,
  });

  revalidatePath("/requests");
  revalidatePath("/dashboard");
  return { success: true, data };
}

async function notifyRequester(
  supabase: Awaited<ReturnType<typeof createClient>>,
  requestId: string,
  requesterId: string,
  type: Parameters<typeof notificationTemplate>[0],
  requestNumber: string,
  extra?: string
) {
  const tmpl = notificationTemplate(type, requestNumber, extra);
  await supabase.rpc("create_notification", {
    p_recipient_id: requesterId,
    p_request_id: requestId,
    p_type: type,
    p_title: tmpl.title,
    p_body: tmpl.body,
  });
}

async function getRequestBasics(supabase: Awaited<ReturnType<typeof createClient>>, requestId: string) {
  const { data, error } = await supabase
    .from("maintenance_requests")
    .select("id, request_number, requested_by, status, assigned_technician_id")
    .eq("id", requestId)
    .single();
  if (error || !data) throw error ?? new Error("Request not found");
  return data;
}

/** SUBMITTED -> RECEIVED -> ACKNOWLEDGED, in one click for Engineering. */
export async function acceptRequest(requestId: string): Promise<ActionResult> {
  await requireSessionUser();
  const supabase = await createClient();

  try {
    const req = await getRequestBasics(supabase, requestId);

    const { error: err1 } = await supabase
      .from("maintenance_requests")
      .update({ status: "RECEIVED" })
      .eq("id", requestId);
    if (err1) throw err1;

    const { error: err2 } = await supabase
      .from("maintenance_requests")
      .update({ status: "ACKNOWLEDGED", acknowledged_at: new Date().toISOString() })
      .eq("id", requestId);
    if (err2) throw err2;

    await notifyRequester(supabase, requestId, req.requested_by, "ACKNOWLEDGED", req.request_number);

    revalidatePath(`/requests/${requestId}`);
    revalidatePath("/requests");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toUserMessage(error) };
  }
}

export async function assignTechnician(
  requestId: string,
  technicianId: string
): Promise<ActionResult> {
  const session = await requireSessionUser();
  const supabase = await createClient();

  try {
    const req = await getRequestBasics(supabase, requestId);

    const { error: updateError } = await supabase
      .from("maintenance_requests")
      .update({
        status: "ASSIGNED",
        assigned_technician_id: technicianId,
        assigned_at: new Date().toISOString(),
      })
      .eq("id", requestId);
    if (updateError) throw updateError;

    await supabase.from("maintenance_assignments").insert({
      request_id: requestId,
      technician_id: technicianId,
      assigned_by: session.id,
    });

    const { data: tech } = await supabase.from("profiles").select("full_name").eq("id", technicianId).single();
    await notifyRequester(supabase, requestId, req.requested_by, "ASSIGNED", req.request_number, tech?.full_name);
    const tmpl = notificationTemplate("ASSIGNED", req.request_number, tech?.full_name);
    await supabase.rpc("create_notification", {
      p_recipient_id: technicianId,
      p_request_id: requestId,
      p_type: "ASSIGNED",
      p_title: `You have been assigned to ${req.request_number}`,
      p_body: tmpl.body,
    });

    revalidatePath(`/requests/${requestId}`);
    revalidatePath("/requests");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toUserMessage(error) };
  }
}

export async function startWork(requestId: string): Promise<ActionResult> {
  await requireSessionUser();
  const supabase = await createClient();

  try {
    const req = await getRequestBasics(supabase, requestId);
    const { error } = await supabase
      .from("maintenance_requests")
      .update({ status: "IN_PROGRESS", started_at: new Date().toISOString() })
      .eq("id", requestId);
    if (error) throw error;

    await notifyRequester(supabase, requestId, req.requested_by, "WORK_STARTED", req.request_number);

    revalidatePath(`/requests/${requestId}`);
    revalidatePath("/requests");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toUserMessage(error) };
  }
}

export async function changeStatus(
  requestId: string,
  newStatus: "SCHEDULED" | "WAITING_FOR_PARTS" | "WAITING_FOR_EXTERNAL_SUPPORT" | "ON_HOLD" | "IN_PROGRESS",
  comment?: string
): Promise<ActionResult> {
  await requireSessionUser();
  const supabase = await createClient();

  try {
    const req = await getRequestBasics(supabase, requestId);
    const { error } = await supabase
      .from("maintenance_requests")
      .update({ status: newStatus })
      .eq("id", requestId);
    if (error) throw error;

    if (comment) {
      await supabase.from("maintenance_request_history").insert({
        request_id: requestId,
        action: "COMMENT_ADDED",
        comment,
      });
    }

    await notifyRequester(supabase, requestId, req.requested_by, "STATUS_CHANGED", req.request_number, newStatus);
    if (newStatus === "WAITING_FOR_PARTS") {
      await notifyRequester(supabase, requestId, req.requested_by, "WAITING_FOR_PARTS", req.request_number);
    }

    revalidatePath(`/requests/${requestId}`);
    revalidatePath("/requests");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toUserMessage(error) };
  }
}

export async function rejectRequest(requestId: string, reason: string): Promise<ActionResult> {
  await requireSessionUser();
  const supabase = await createClient();

  try {
    const req = await getRequestBasics(supabase, requestId);
    const fromReceived = req.status === "RECEIVED";
    const { error } = await supabase
      .from("maintenance_requests")
      .update({ status: "REJECTED", rejection_reason: reason })
      .eq("id", requestId);
    if (error) throw error;
    void fromReceived;

    await notifyRequester(supabase, requestId, req.requested_by, "STATUS_CHANGED", req.request_number, "Rejected");

    revalidatePath(`/requests/${requestId}`);
    revalidatePath("/requests");
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toUserMessage(error) };
  }
}

export async function cancelRequest(requestId: string): Promise<ActionResult> {
  const session = await requireSessionUser();
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("maintenance_requests")
      .update({ status: "CANCELLED" })
      .eq("id", requestId)
      .eq("requested_by", session.id);
    if (error) throw error;

    revalidatePath(`/requests/${requestId}`);
    revalidatePath("/requests");
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toUserMessage(error) };
  }
}

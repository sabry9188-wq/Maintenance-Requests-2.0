"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/get-session";
import { feedbackSchema, type FeedbackInput } from "@/lib/validation/feedback-schema";
import { toUserMessage } from "@/lib/utils/error-messages";
import type { ActionResult } from "./request-actions";

export async function submitFeedback(input: FeedbackInput): Promise<ActionResult> {
  const session = await requireSessionUser();
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid feedback." };
  }
  const values = parsed.data;
  const supabase = await createClient();

  try {
    const { error } = await supabase.from("feedback").insert({
      request_id: values.request_id,
      submitted_by: session.id,
      problem_solved: values.problem_solved,
      rating: values.rating,
      comment: values.comment || null,
    });
    if (error) throw error;

    revalidatePath(`/requests/${values.request_id}`);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toUserMessage(error, "Unable to submit feedback. Please try again.") };
  }
}

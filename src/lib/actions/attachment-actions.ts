"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/get-session";
import { toUserMessage } from "@/lib/utils/error-messages";
import type { ActionResult } from "./request-actions";

export async function recordAttachment(
  requestId: string,
  filePath: string,
  fileName: string,
  fileType: string,
  attachmentKind: string
): Promise<ActionResult> {
  const session = await requireSessionUser();
  const supabase = await createClient();

  const { error } = await supabase.from("maintenance_request_attachments").insert({
    request_id: requestId,
    uploaded_by: session.id,
    file_path: filePath,
    file_name: fileName,
    file_type: fileType,
    attachment_kind: attachmentKind,
  });

  if (error) return { success: false, error: toUserMessage(error, "Photo upload failed.") };
  revalidatePath(`/requests/${requestId}`);
  return { success: true, data: undefined };
}

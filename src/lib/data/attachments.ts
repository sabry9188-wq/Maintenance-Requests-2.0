import { createClient } from "@/lib/supabase/server";
import type { MaintenanceRequestAttachmentRow } from "@/lib/types/database.types";

const KIND_TO_BUCKET: Record<string, string> = {
  REQUEST_PHOTO: "request-photos",
  BEFORE_PHOTO: "repair-photos",
  AFTER_PHOTO: "repair-photos",
  COMPLETION_DOC: "completion-docs",
  SUPPORTING_DOC: "supporting-docs",
};

export interface AttachmentWithUrl extends MaintenanceRequestAttachmentRow {
  url: string | null;
}

export async function getAttachmentsWithUrls(
  attachments: MaintenanceRequestAttachmentRow[]
): Promise<AttachmentWithUrl[]> {
  const supabase = await createClient();

  return Promise.all(
    attachments.map(async (a) => {
      const bucket = KIND_TO_BUCKET[a.attachment_kind] ?? "request-photos";
      const { data } = await supabase.storage.from(bucket).createSignedUrl(a.file_path, 3600);
      return { ...a, url: data?.signedUrl ?? null };
    })
  );
}

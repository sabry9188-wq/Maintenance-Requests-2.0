"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/get-session";

export async function markNotificationRead(notificationId: string) {
  const session = await requireSessionUser();
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("recipient_id", session.id);
  revalidatePath("/notifications");
}

export async function markAllNotificationsRead() {
  const session = await requireSessionUser();
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient_id", session.id)
    .eq("is_read", false);
  revalidatePath("/notifications");
}

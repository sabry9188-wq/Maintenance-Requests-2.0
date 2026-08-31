import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/types/database.types";

export interface SessionUser {
  id: string;
  email: string;
  profile: ProfileRow;
}

/**
 * Returns the current authenticated user + their profile row, or null.
 * Use in Server Components / Server Actions.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return { id: user.id, email: user.email ?? profile.email, profile };
}

/**
 * Same as getSessionUser but redirects to /login when there is no session.
 * Use at the top of protected Server Components/pages.
 */
export async function requireSessionUser(): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }
  return session;
}

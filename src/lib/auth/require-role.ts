import { redirect } from "next/navigation";
import { requireSessionUser, type SessionUser } from "./get-session";
import type { UserRole } from "@/lib/types/database.types";

/**
 * Ensures the current user is authenticated AND has one of the allowed
 * roles. Redirects to /dashboard (with no error leak) otherwise.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<SessionUser> {
  const session = await requireSessionUser();
  if (!allowedRoles.includes(session.profile.role)) {
    redirect("/dashboard");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole(["ADMIN"]);
}

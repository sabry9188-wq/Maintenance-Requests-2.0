import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database.types";

/**
 * Service-role client - bypasses Row Level Security entirely.
 * Only ever call this inside a "use server" action that has already checked
 * requireAdmin(). Never import this into a client component, and never let
 * SUPABASE_SERVICE_ROLE_KEY reach the browser (it has no NEXT_PUBLIC_ prefix
 * on purpose).
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

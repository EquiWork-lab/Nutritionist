import { createClient as createSbClient } from "@supabase/supabase-js";
import { config } from "@/lib/config";

/**
 * Server-only admin client (uses the service-role key). Bypasses RLS.
 * Use for webhook writes and single-owner CRM reads/writes. NEVER import
 * this into client components.
 */
export function createAdminClient() {
  return createSbClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isAdminConfigured(): boolean {
  return Boolean(config.supabase.url && config.supabase.serviceRoleKey);
}

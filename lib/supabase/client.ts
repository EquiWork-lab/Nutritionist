"use client";

import { createBrowserClient } from "@supabase/ssr";
import { config } from "@/lib/config";

/** Browser-side Supabase client (uses the public anon key only). */
export function createClient() {
  return createBrowserClient(config.supabase.url, config.supabase.anonKey);
}

"use server";

import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";

/**
 * Public lead capture from the landing-page contact form.
 * Writes a `lead` row to Supabase when configured; otherwise a graceful no-op.
 */
export async function submitLead(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!email) return;
  if (!isAdminConfigured()) return;

  try {
    const admin = createAdminClient();
    await admin.from("clients").insert({
      name: name || null,
      email,
      notes: note || null,
      status: "lead",
    });
  } catch {
    // swallow — the UI shows a generic thank-you regardless
  }
}

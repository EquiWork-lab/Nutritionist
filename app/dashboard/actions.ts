"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Add a client/lead to the CRM. */
export async function addClient(formData: FormData): Promise<void> {
  if (!isAdminConfigured()) return;
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const plan = String(formData.get("plan") ?? "").trim();
  const status = String(formData.get("status") ?? "lead").trim();
  if (!name && !email) return;

  const admin = createAdminClient();
  await admin.from("clients").insert({
    name: name || null,
    email: email || null,
    plan: plan || null,
    status: status || "lead",
  });
  revalidatePath("/dashboard");
}

/** Sign the current user out and return to the landing page. */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

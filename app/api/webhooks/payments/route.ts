import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import type { PaymentEvent } from "@/lib/payments/types";

export const runtime = "nodejs";

/**
 * Payment provider webhook / notification endpoint.
 * The active provider verifies + normalizes the request into a PaymentEvent,
 * then we persist the result to Supabase (if configured).
 */
async function process(req: Request): Promise<PaymentEvent> {
  const provider = getPaymentProvider();
  const event = await provider.handleWebhook(req);

  if (isAdminConfigured() && event.orderId) {
    try {
      const admin = createAdminClient();
      await admin
        .from("subscriptions")
        .update({
          status: event.status === "succeeded" ? "active" : "failed",
          provider_ref: event.providerRef ?? null,
          recurring_token: event.recurringToken ?? null,
        })
        .eq("order_id", event.orderId);
    } catch {
      // non-fatal
    }
  }

  return event;
}

export async function POST(req: Request) {
  try {
    const event = await process(req);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 400 }
    );
  }
}

// The mock provider redirects here with GET for local end-to-end testing.
export async function GET(req: Request) {
  try {
    const event = await process(req);
    return NextResponse.redirect(
      new URL(`/dashboard?paid=${event.orderId}`, req.url)
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 400 }
    );
  }
}

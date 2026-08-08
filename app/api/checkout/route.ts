import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * POST /api/checkout
 * Body: { productId, priceMinor, currency, description, recurring, customer }
 * Persists a pending subscription (if Supabase is configured), then creates a
 * checkout with the active provider and returns { redirectUrl }.
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const provider = getPaymentProvider();

    const orderId =
      data.orderId ?? `ord_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

    // Record the pending order so the webhook can flip it to active later.
    if (isAdminConfigured()) {
      try {
        const admin = createAdminClient();
        await admin.from("subscriptions").insert({
          order_id: orderId,
          product_id: data.productId ?? null,
          amount_minor: Number(data.priceMinor ?? 0),
          currency: data.currency ?? "BYN",
          provider: provider.name,
          status: "pending",
        });
      } catch {
        // non-fatal: still allow the payment to proceed
      }
    }

    const result = await provider.createCheckout({
      orderId,
      amountMinor: Number(data.priceMinor ?? 0),
      currency: data.currency ?? "BYN",
      description: data.description ?? "Nutrition service",
      recurring: Boolean(data.recurring),
      customer: data.customer,
    });

    return NextResponse.json({ ok: true, orderId, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 400 }
    );
  }
}

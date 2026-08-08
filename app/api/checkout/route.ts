import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";

export const runtime = "nodejs";

/**
 * POST /api/checkout
 * Body: { productId, priceMinor, currency, description, recurring, customer }
 * Creates a checkout with the active provider and returns { redirectUrl }.
 *
 * In a full build this also writes a "pending" subscription row to Supabase
 * before redirecting; the webhook then flips it to "active".
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const provider = getPaymentProvider();

    const orderId =
      data.orderId ?? `ord_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

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

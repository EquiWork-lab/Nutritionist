import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";

export const runtime = "nodejs";

/**
 * Payment provider webhook / notification endpoint.
 * The active provider verifies + normalizes the request into a PaymentEvent.
 *
 * In a full build, on status === "succeeded" you would:
 *   - mark the subscription/order active in Supabase
 *   - store recurringToken for future auto-charges
 *   - (optionally) issue the НПД receipt / send confirmation email
 */
async function process(req: Request) {
  const provider = getPaymentProvider();
  const event = await provider.handleWebhook(req);

  // TODO: persist to Supabase using SUPABASE_SERVICE_ROLE_KEY.
  // await markOrderPaid(event.orderId, event.status, event.recurringToken)

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

import { type NextRequest } from "next/server";
import { renderWebpayAutoSubmit } from "@/lib/payments/webpay";

export const runtime = "nodejs";

/**
 * Renders the server-signed WEBPAY form and auto-submits the customer to
 * WEBPAY. The secret key is used here (server) only — never sent to the client.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") ?? undefined;
  try {
    const html = renderWebpayAutoSubmit({
      orderId: searchParams.get("orderId") ?? "",
      amountMinor: Number(searchParams.get("amountMinor") ?? 0),
      currency: (searchParams.get("currency") as "BYN") ?? "BYN",
      description: searchParams.get("description") ?? "Nutrition service",
      customer: email ? { email } : undefined,
    });
    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    return new Response(`WEBPAY error: ${(err as Error).message}`, {
      status: 400,
    });
  }
}

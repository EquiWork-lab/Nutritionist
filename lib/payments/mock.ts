import type {
  PaymentProvider,
  CheckoutParams,
  CheckoutResult,
  PaymentEvent,
} from "./types";
import { config } from "@/lib/config";

/**
 * Mock provider for local development — no gateway account needed.
 * It "redirects" to an internal fake page that immediately marks the order
 * paid.  Lets you build and test the entire subscription flow end-to-end
 * before a real merchant account (ИП + расчётный счёт) exists.
 */
export class MockProvider implements PaymentProvider {
  readonly name = "mock";

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const url = new URL("/api/webhooks/payments", config.site.url);
    url.searchParams.set("mock", "1");
    url.searchParams.set("orderId", params.orderId);
    url.searchParams.set("status", "succeeded");
    return { redirectUrl: url.toString(), providerRef: `mock_${params.orderId}` };
  }

  async handleWebhook(req: Request): Promise<PaymentEvent> {
    const url = new URL(req.url);
    return {
      orderId: url.searchParams.get("orderId") ?? "",
      status: (url.searchParams.get("status") as "succeeded") ?? "succeeded",
      providerRef: `mock_${url.searchParams.get("orderId") ?? ""}`,
      raw: { mock: true },
    };
  }
}

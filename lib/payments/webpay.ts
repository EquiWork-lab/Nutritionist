import type {
  PaymentProvider,
  CheckoutParams,
  CheckoutResult,
  PaymentEvent,
} from "./types";
import { config } from "@/lib/config";

/**
 * WEBPAY provider (alternative to bePaid).  Cards + ЕРИП.
 * Docs: https://docs.webpay.by/en/
 *
 * WEBPAY uses a signed form-POST redirect flow rather than a JSON API.
 * This is a scaffold stub: wire the exact field set + signature (wsb_signature)
 * from the current WEBPAY docs before going live.  Kept behind the same
 * interface so switching provider = changing PAYMENT_PROVIDER only.
 */
export class WebpayProvider implements PaymentProvider {
  readonly name = "webpay";

  async createCheckout(_params: CheckoutParams): Promise<CheckoutResult> {
    if (!config.payments.webpay.storeId) {
      throw new Error("WEBPAY not configured (set WEBPAY_STORE_ID / WEBPAY_SECRET_KEY).");
    }
    // TODO: build the signed WEBPAY payment form and return its URL.
    throw new Error("WebpayProvider.createCheckout not implemented yet — see docs.webpay.by");
  }

  async handleWebhook(_req: Request): Promise<PaymentEvent> {
    // TODO: verify wsb_signature against WEBPAY_WEBHOOK_SECRET, then normalize.
    throw new Error("WebpayProvider.handleWebhook not implemented yet.");
  }
}

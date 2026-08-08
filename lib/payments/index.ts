import type { PaymentProvider } from "./types";
import { MockProvider } from "./mock";
import { BepaidProvider } from "./bepaid";
import { WebpayProvider } from "./webpay";
import { config } from "@/lib/config";

/**
 * Provider factory.  The active provider is chosen by the PAYMENT_PROVIDER
 * env var — the only place the concrete gateway is named.
 */
export function getPaymentProvider(): PaymentProvider {
  switch (config.payments.provider) {
    case "bepaid":
      return new BepaidProvider();
    case "webpay":
      return new WebpayProvider();
    case "mock":
    default:
      return new MockProvider();
  }
}

export type { PaymentProvider } from "./types";

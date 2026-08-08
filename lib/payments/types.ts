/**
 * Payment abstraction.  The rest of the app talks ONLY to this interface,
 * never to a specific gateway.  Swapping bePaid <-> WEBPAY (or plugging in a
 * new provider on the new owner's account) means adding one file that
 * implements PaymentProvider — no other code changes.
 */

export interface CheckoutParams {
  /** Internal order/subscription id we generated. */
  orderId: string;
  /** Amount in minor units (kopecks). 2500 = 25.00 BYN. */
  amountMinor: number;
  currency: "BYN" | "USD" | "EUR";
  /** Human description shown on the payment page. */
  description: string;
  /** Whether this should be set up for recurring (subscription) billing. */
  recurring?: boolean;
  customer?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface CheckoutResult {
  /** URL to redirect the customer to in order to pay. */
  redirectUrl: string;
  /** Provider-side transaction/token id, if returned synchronously. */
  providerRef?: string;
}

export type PaymentStatus = "succeeded" | "failed" | "pending";

export interface PaymentEvent {
  orderId: string;
  status: PaymentStatus;
  providerRef?: string;
  /** For recurring: the token/card id to use for future auto-charges. */
  recurringToken?: string;
  raw: unknown;
}

export interface PaymentProvider {
  readonly name: string;
  /** Create a checkout session and return where to send the customer. */
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>;
  /** Parse + verify an incoming webhook request into a normalized event. */
  handleWebhook(req: Request): Promise<PaymentEvent>;
}

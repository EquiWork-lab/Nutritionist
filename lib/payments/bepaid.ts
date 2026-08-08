import type {
  PaymentProvider,
  CheckoutParams,
  CheckoutResult,
  PaymentEvent,
} from "./types";
import { config } from "@/lib/config";

/**
 * bePaid provider.  Recommended for Belarus + recurring subscriptions
 * (supports card tokenization for auto-charges; ЕРИП is available as a method).
 *
 * Docs: https://docs.bepaid.by/en/
 * Uses the Checkout (payment token) API: POST https://checkout.bepaid.eu/ctp/api/checkouts
 * Auth = HTTP Basic (shop id : secret key).
 *
 * NOTE: fill BEPAID_SHOP_ID / BEPAID_SECRET_KEY and set PAYMENT_PROVIDER=bepaid.
 * In test mode use bePaid sandbox credentials.
 */
export class BepaidProvider implements PaymentProvider {
  readonly name = "bepaid";
  private endpoint = "https://checkout.bepaid.eu/ctp/api/checkouts";

  private authHeader(): string {
    const { shopId, secretKey } = config.payments.bepaid;
    const token = Buffer.from(`${shopId}:${secretKey}`).toString("base64");
    return `Basic ${token}`;
  }

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const body = {
      checkout: {
        test: config.payments.mode === "test",
        transaction_type: "payment",
        order: {
          amount: params.amountMinor,
          currency: params.currency,
          description: params.description,
          tracking_id: params.orderId,
        },
        settings: {
          success_url: `${config.site.url}/dashboard?paid=${params.orderId}`,
          decline_url: `${config.site.url}/pricing?declined=1`,
          fail_url: `${config.site.url}/pricing?failed=1`,
          notification_url: `${config.site.url}/api/webhooks/payments`,
        },
        // Tokenize the card so future subscription charges can be made.
        ...(params.recurring ? { transaction_type: "payment", additional_data: { save_card: true } } : {}),
        customer: params.customer
          ? {
              email: params.customer.email,
              first_name: params.customer.firstName,
              last_name: params.customer.lastName,
            }
          : undefined,
      },
    };

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: this.authHeader(),
        "X-API-Version": "2",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`bePaid checkout failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as {
      checkout?: { token?: string; redirect_url?: string };
    };
    const redirectUrl = data.checkout?.redirect_url;
    if (!redirectUrl) throw new Error("bePaid: no redirect_url returned");

    return { redirectUrl, providerRef: data.checkout?.token };
  }

  async handleWebhook(req: Request): Promise<PaymentEvent> {
    // bePaid sends a JSON body. Verify authenticity before trusting it.
    // Depending on shop settings this is HTTP Basic auth on the callback or a
    // signature — verify against BEPAID_WEBHOOK_SECRET here before going live.
    const payload = (await req.json()) as {
      transaction?: {
        tracking_id?: string;
        status?: string;
        uid?: string;
        credit_card?: { token?: string };
      };
    };
    const t = payload.transaction;
    const status =
      t?.status === "successful"
        ? "succeeded"
        : t?.status === "failed"
          ? "failed"
          : "pending";

    return {
      orderId: t?.tracking_id ?? "",
      status,
      providerRef: t?.uid,
      recurringToken: t?.credit_card?.token,
      raw: payload,
    };
  }
}

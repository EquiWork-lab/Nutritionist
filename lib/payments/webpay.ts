import crypto from "crypto";
import type {
  PaymentProvider,
  CheckoutParams,
  CheckoutResult,
  PaymentEvent,
} from "./types";
import { config } from "@/lib/config";

/**
 * WEBPAY provider (cards + ЕРИП).  Docs: https://docs.webpay.by/en/
 *
 * WEBPAY uses a signed form-POST redirect flow (not a JSON API):
 *  - Request signature (form v2): SHA1( seed + storeid + order_num + test
 *    + currency_id + total + secretKey )
 *  - Notification signature: MD5( batch_timestamp + currency_id + amount
 *    + payment_method + order_id + site_order_id + transaction_id
 *    + payment_type + rrn + [card] + secretKey )
 *
 * NOTE: verify the exact field order against your store's current WEBPAY
 * manual before going live — WEBPAY has minor per-account variations.
 */

const WEBPAY_ACTION = {
  test: "https://securesandbox.webpay.by/",
  live: "https://payment.webpay.by/",
} as const;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Build the signed WEBPAY form fields + POST action for a checkout. */
export function buildWebpayForm(params: CheckoutParams): {
  action: string;
  fields: Record<string, string>;
} {
  const { storeId, secretKey } = config.payments.webpay;
  if (!storeId || !secretKey) {
    throw new Error(
      "WEBPAY not configured (set WEBPAY_STORE_ID / WEBPAY_SECRET_KEY)."
    );
  }

  const test = config.payments.mode === "test" ? "1" : "0";
  const seed = `${Date.now()}${Math.floor(Math.random() * 1e6)}`;
  const total = (params.amountMinor / 100).toFixed(2);
  const currency = params.currency;
  const orderNum = params.orderId;

  const signature = crypto
    .createHash("sha1")
    .update(seed + storeId + orderNum + test + currency + total + secretKey)
    .digest("hex");

  const fields: Record<string, string> = {
    "*scart": "",
    wsb_version: "2",
    wsb_storeid: storeId,
    wsb_order_num: orderNum,
    wsb_currency_id: currency,
    wsb_test: test,
    wsb_seed: seed,
    wsb_total: total,
    wsb_signature: signature,
    "wsb_invoice_item_name[0]": params.description,
    "wsb_invoice_item_quantity[0]": "1",
    "wsb_invoice_item_price[0]": total,
    wsb_return_url: `${config.site.url}/dashboard?paid=${orderNum}`,
    wsb_cancel_return_url: `${config.site.url}/pricing?canceled=1`,
    wsb_notify_url: `${config.site.url}/api/webhooks/payments`,
  };

  if (params.customer?.email) fields.wsb_email = params.customer.email;

  const action =
    config.payments.mode === "test" ? WEBPAY_ACTION.test : WEBPAY_ACTION.live;

  return { action, fields };
}

/** Render an auto-submitting HTML form that posts the customer to WEBPAY. */
export function renderWebpayAutoSubmit(params: CheckoutParams): string {
  const { action, fields } = buildWebpayForm(params);
  const inputs = Object.entries(fields)
    .map(
      ([k, v]) =>
        `<input type="hidden" name="${escapeHtml(k)}" value="${escapeHtml(v)}">`
    )
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Переход к оплате…</title></head><body onload="document.forms[0].submit()"><form method="POST" action="${action}">${inputs}<noscript><button type="submit">Продолжить к оплате</button></noscript></form></body></html>`;
}

export class WebpayProvider implements PaymentProvider {
  readonly name = "webpay";

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    if (!config.payments.webpay.storeId) {
      throw new Error(
        "WEBPAY not configured (set WEBPAY_STORE_ID / WEBPAY_SECRET_KEY)."
      );
    }
    // Defer the actual signed form to an internal route that renders it
    // server-side (so the secret never reaches the browser).
    const u = new URL(`${config.site.url}/api/pay/webpay`);
    u.searchParams.set("orderId", params.orderId);
    u.searchParams.set("amountMinor", String(params.amountMinor));
    u.searchParams.set("currency", params.currency);
    u.searchParams.set("description", params.description);
    if (params.customer?.email) u.searchParams.set("email", params.customer.email);
    return { redirectUrl: u.toString() };
  }

  async handleWebhook(req: Request): Promise<PaymentEvent> {
    const contentType = req.headers.get("content-type") ?? "";
    const data: Record<string, string> = {};
    if (contentType.includes("application/json")) {
      Object.assign(data, await req.json());
    } else {
      const fd = await req.formData();
      fd.forEach((v, k) => (data[k] = String(v)));
    }

    const { secretKey } = config.payments.webpay;
    const card = data["card"] ?? "";
    const base =
      `${data.batch_timestamp ?? ""}${data.currency_id ?? ""}${data.amount ?? ""}` +
      `${data.payment_method ?? ""}${data.order_id ?? ""}${data.site_order_id ?? ""}` +
      `${data.transaction_id ?? ""}${data.payment_type ?? ""}${data.rrn ?? ""}${card}${secretKey}`;
    const expected = crypto.createHash("md5").update(base).digest("hex");
    const ok =
      Boolean(data.wsb_signature) &&
      expected.toLowerCase() === String(data.wsb_signature).toLowerCase();

    const status = ok && data.transaction_id ? "succeeded" : "failed";

    return {
      orderId: data.site_order_id ?? data.order_id ?? "",
      status,
      providerRef: data.transaction_id,
      raw: data,
    };
  }
}

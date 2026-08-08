/**
 * Central config reader.  Every account-specific value is read here from
 * environment variables and nowhere else.  This is the seam that makes the
 * whole project portable between owners (see MIGRATION.md).
 */

export const config = {
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    brand: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Nutrition",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  },
  payments: {
    provider: (process.env.PAYMENT_PROVIDER ?? "mock").toLowerCase(),
    mode: (process.env.PAYMENT_MODE ?? "test").toLowerCase(),
    bepaid: {
      shopId: process.env.BEPAID_SHOP_ID ?? "",
      secretKey: process.env.BEPAID_SECRET_KEY ?? "",
      webhookSecret: process.env.BEPAID_WEBHOOK_SECRET ?? "",
    },
    webpay: {
      storeId: process.env.WEBPAY_STORE_ID ?? "",
      secretKey: process.env.WEBPAY_SECRET_KEY ?? "",
      webhookSecret: process.env.WEBPAY_WEBHOOK_SECRET ?? "",
    },
  },
} as const;

/** True when Supabase env vars are present (used to guard server code). */
export function isSupabaseConfigured(): boolean {
  return Boolean(config.supabase.url && config.supabase.anonKey);
}

# Nutritionist — personal brand + mini-CRM + subscriptions

A portable starter for a nutritionist's wellness brand: landing page, client
mini-CRM, and subscription products. Built so the **entire project can be
handed over to a new owner** (her own Google account, her own Vercel/Render,
her own API keys) with zero code changes — see [`MIGRATION.md`](./MIGRATION.md).

## Stack

- **Next.js 15** (App Router, TypeScript) — deploys identically to Vercel or Render.
- **Supabase** (free tier) — Auth + Postgres + Storage.
- **Tailwind CSS v4** — editorial / Scandinavian-wellness styling.
- **Swappable payment layer** — `lib/payments/` behind one `PaymentProvider`
  interface. Active provider chosen by the `PAYMENT_PROVIDER` env var:
  `mock` (default, no account needed) · `bepaid` (recommended for Belarus +
  recurring) · `webpay` (stub).

## The one rule that makes this portable

**Everything account-specific lives in environment variables, never in code.**
API keys, database URL, domain, payment credentials — all in `.env` (see
[`.env.example`](./.env.example)). Handover = new accounts + new env values +
redeploy. Nothing in `app/` or `lib/` needs editing.

## Run locally

```bash
cp .env.example .env.local     # PAYMENT_PROVIDER=mock works with no accounts
npm install
npm run dev                    # http://localhost:3000
```

With `PAYMENT_PROVIDER=mock` you can click through the full subscription flow
(pricing → "pay" → dashboard) before any real gateway or Supabase project exists.

## Connect Supabase (free)

1. Create a project at supabase.com.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the SQL editor.
3. Copy the URL + anon key + service-role key into `.env.local`.

## What's wired

- **Auth** — Supabase magic-link login (`/login` → `/auth/callback`), session
  refresh via `middleware.ts`, protected `/dashboard`, sign-out.
- **Mini-CRM** — `/dashboard` shows stat tiles (contacts, active, leads, MRR),
  an add-client form, the clients table, and a subscriptions/orders table.
- **Lead capture** — the landing contact form writes a `lead` to Supabase.
- **Payments** — swappable layer: `mock`, real **bePaid** (JSON API, recurring
  tokenization), real **WEBPAY** (signed form-POST via `/api/pay/webpay`,
  SHA1 request signature + MD5 notification verification).
- **Persistence** — checkout writes a pending order; the webhook flips it to
  active and stores the recurring token.

> Supabase Auth: in the Supabase dashboard add your deployment URL (and
> `http://localhost:3000`) under Authentication → URL Configuration → Redirect
> URLs, including `/auth/callback`.

## Enable real payments (bePaid)

1. Set `PAYMENT_PROVIDER=bepaid`, keep `PAYMENT_MODE=test` for sandbox.
2. Fill `BEPAID_SHOP_ID` / `BEPAID_SECRET_KEY` / `BEPAID_WEBHOOK_SECRET`.
3. Point the bePaid notification URL at `/api/webhooks/payments`.

## ⚠️ Legal notes (Belarus)

- **No medical claims.** Copy intentionally avoids «лечу / диагностирую /
  восстанавливаю гормоны / гарантирую результат». Keep it that way. The site
  states nutrition work does not replace a doctor.
- **Payments require legal status.** bePaid / WEBPAY / ЕРИП merchant accounts
  require ИП or a company + a Belarusian settlement account. On **НПД**
  (self-employment) full card acquiring is generally unavailable; payment is
  taken to a personal account and the receipt is issued via the «Налог на
  профессиональный доход» app. Keep `PAYMENT_PROVIDER=mock` until the right
  status + account exist. Note the НПД minimum of 45 BYN/month from 1 Jul 2026.
- Verify the specific activity classification before charging for services.

## Deploy

- **Vercel (free Hobby)** — import the repo, add env vars, deploy. Native Next.js.
- **Render (free)** — [`render.yaml`](./render.yaml) is included; add env vars in
  the dashboard. Use this for the eventual production owner if preferred.

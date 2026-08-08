# Ownership handover runbook

This project is deliberately built so it can move from **your** accounts
(Phase 1 — testing) to **her** accounts (Phase 2 — production), completely and
cleanly. Because every account-specific value lives in environment variables,
the migration is *configuration only* — no code is rewritten.

---

## Phase 1 — now (your accounts, "testing & toasting")

You build and demo on infrastructure you control, then throw it away.

| Layer      | Phase-1 owner | Free? |
|------------|---------------|-------|
| Git repo   | `EquiWork-lab/Nutritionist` (yours) | yes |
| Hosting    | Your Vercel (Hobby) **or** your Render | yes |
| Database/Auth | Your Supabase project | yes |
| Payments   | `mock` (or bePaid **sandbox**) | yes |
| Domain     | `*.vercel.app` / `*.onrender.com` placeholder | yes |

Nothing here is permanent. No real customer data, no real charges (keep
`PAYMENT_MODE=test`). When Phase 2 is done you simply delete the Render/Vercel
service and pause the Supabase project.

---

## Phase 2 — handover (her accounts)

Do these in order. Estimated time: ~1–2 hours, no coding.

### 1. Her Google identity
- She creates a dedicated Google account (e.g. `annanutrition@gmail.com`).
- Use it to sign up for GitHub, Vercel/Render, and Supabase — so every service
  is under *her* email from day one.

### 2. Move the code repo to her
- Either **transfer** the GitHub repo to her account/org (Settings → Transfer),
  **or** she forks/creates her own and you push the code there once.
- After transfer, remove your access. The code carries no secrets (only
  `.env.example`), so this is safe.

### 3. Fresh Supabase project (hers)
- She creates a new Supabase project under her Google login.
- Run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL editor.
- Copy her new URL + anon key + service-role key.
- **Data:** Phase-1 data is throwaway. If any real client rows must move, export
  from the old project (CSV / `pg_dump`) and import into hers.

### 4. Her hosting
- She creates a Vercel (or Render) account and imports the repo.
- Set env vars from her values (below). Deploy.

### 5. Her payment + legal setup
- Confirm her legal status (ИП / НПД) and, if applicable, her merchant account
  with bePaid/WEBPAY (requires a Belarusian settlement account).
- Put **her** `BEPAID_SHOP_ID` / `BEPAID_SECRET_KEY` / `BEPAID_WEBHOOK_SECRET`.
- Flip `PAYMENT_PROVIDER=bepaid` and, when live, `PAYMENT_MODE=live`.
- Point the bePaid notification URL to `https://HER-DOMAIN/api/webhooks/payments`.

### 6. Her domain
- She buys / connects the domain (e.g. `annanutrition.by`).
- Set `NEXT_PUBLIC_SITE_URL=https://annanutrition.by` and update the DNS at the
  host. Update payment return/notification URLs to the new domain.

### 7. Cut over, then shut down yours
- Verify her deployment works end-to-end on her domain.
- Delete your Phase-1 Render/Vercel service and pause/delete your Supabase
  project. Remove any of your API keys. **Done — no trace of you remains.**

---

## Environment variables to re-issue under her accounts

Every one of these changes from your value to hers. Nothing else does.

```
NEXT_PUBLIC_SITE_URL            → her domain
NEXT_PUBLIC_BRAND_NAME          → her brand
NEXT_PUBLIC_SUPABASE_URL        → her Supabase project
NEXT_PUBLIC_SUPABASE_ANON_KEY   → her Supabase
SUPABASE_SERVICE_ROLE_KEY       → her Supabase
PAYMENT_PROVIDER                → bepaid (was mock)
PAYMENT_MODE                    → live (after go-live)
BEPAID_SHOP_ID / SECRET_KEY / WEBHOOK_SECRET → her merchant account
```

## Handover checklist

- [ ] Repo transferred to her GitHub; your access removed
- [ ] Her Supabase project created + schema applied
- [ ] Her hosting deployed with her env vars
- [ ] Her domain connected + `NEXT_PUBLIC_SITE_URL` updated
- [ ] Her payment keys in; webhook URL points to her domain
- [ ] End-to-end test passed on her infrastructure
- [ ] Your Phase-1 services deleted, your keys revoked

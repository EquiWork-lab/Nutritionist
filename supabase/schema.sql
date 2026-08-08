-- ==========================================================================
--  Supabase schema — run in the Supabase SQL editor of EACH project.
--  Portable: no owner-specific data here, only structure.  Re-run this on the
--  new owner's fresh Supabase project during migration (see MIGRATION.md).
-- ==========================================================================

-- Products / subscription tiers offered on the site.
create table if not exists public.products (
  id            text primary key,
  name          text not null,
  description   text,
  price_minor   integer not null,          -- kopecks; 22000 = 220.00 BYN
  currency      text not null default 'BYN',
  recurring     boolean not null default false,
  interval      text,                      -- 'month' when recurring
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Clients / leads (the mini-CRM).
create table if not exists public.clients (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid references auth.users(id) on delete set null,
  name          text,
  email         text,
  phone         text,
  plan          text,
  status        text not null default 'lead',   -- lead | active | paused | churned
  notes         text,
  created_at    timestamptz not null default now()
);

-- Subscriptions / orders.
create table if not exists public.subscriptions (
  id                uuid primary key default gen_random_uuid(),
  client_id         uuid references public.clients(id) on delete cascade,
  product_id        text references public.products(id),
  order_id          text unique not null,        -- our tracking_id
  status            text not null default 'pending', -- pending|active|failed|canceled
  provider          text,                        -- bepaid | webpay | mock
  provider_ref      text,                        -- gateway transaction id
  recurring_token   text,                        -- card token for auto-charges
  amount_minor      integer,
  currency          text default 'BYN',
  current_period_end timestamptz,
  created_at        timestamptz not null default now()
);

-- Row Level Security. Enable, then add policies appropriate to your auth model.
alter table public.clients enable row level security;
alter table public.subscriptions enable row level security;

-- Example: a signed-in user can read only their own client row.
create policy if not exists "clients self read"
  on public.clients for select
  using (auth.uid() = auth_user_id);

-- Server-side writes use the service-role key, which bypasses RLS.

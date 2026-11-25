-- Bastilla schema.
--
-- Row-level security is intentionally off on every table here. Each one is
-- reached only from a Next.js Route Handler using the Supabase secret key,
-- which bypasses RLS regardless, so a policy would protect nothing while
-- silently breaking writes if the key were ever swapped for an anon one.
--
-- Everything is `if not exists` so the file can be re-run safely against a
-- project that already holds some of these tables.

-- Week 1: generated channel copy.
create table if not exists core_outputs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  item_name text not null,
  category text,
  fabric text,
  details text,
  colors text,
  sizes text,
  price_mxn numeric,
  occasion text,
  output_instagram text not null,
  output_facebook text not null,
  output_whatsapp text not null,
  used_channel text
);

create index if not exists core_outputs_created_at_idx on core_outputs (created_at desc);

-- Week 1: baskets the agent assembled, awaiting human confirmation.
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_label text,
  basket jsonb not null,
  subtotal_mxn numeric not null,
  item_count integer not null,
  status text not null default 'pending_review',
  transcript jsonb
);

create index if not exists orders_created_at_idx on orders (created_at desc);

-- Week 2: research findings logged over time.
create table if not exists research_records (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null,
  category text not null,
  note text not null
);

create index if not exists research_records_created_at_idx on research_records (created_at desc);

-- Week 3: saved pricing scenarios.
-- The assumptions are stored alongside the result so a saved scenario stays
-- comparable even after the live tier prices or default mix change.
create table if not exists pricing_scenarios (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  preset text not null,
  customers integer not null,
  share_solo numeric not null,
  share_negocio numeric not null,
  share_taller numeric not null,
  churn_pct numeric not null,
  price_solo integer not null,
  price_negocio integer not null,
  price_taller integer not null,
  mrr_mxn numeric not null,
  arr_mxn numeric not null,
  arpu_mxn numeric not null
);

create index if not exists pricing_scenarios_created_at_idx on pricing_scenarios (created_at desc);

-- Week 4: A/B experiment events.
--
-- One row per impression or click. `visitor_id` is a random id minted in the
-- browser and kept in localStorage; it identifies a browser, not a person, and
-- carries nothing about who they are. The variant is re-derived server-side
-- from that id before the row is written, so a hand-rolled request cannot
-- credit clicks to a variant the visitor was never shown.
create table if not exists ab_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  experiment text not null,
  variant text not null,
  event text not null check (event in ('impression', 'click')),
  visitor_id text not null
);

create index if not exists ab_events_created_at_idx on ab_events (created_at desc);
create index if not exists ab_events_group_idx on ab_events (experiment, variant, event);

-- Week 4: marketing assets saved out of the content system.
create table if not exists marketing_assets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null,
  label text not null,
  channel text,
  lang text not null check (lang in ('es', 'en')),
  body text not null
);

create index if not exists marketing_assets_created_at_idx on marketing_assets (created_at desc);

-- Week 5: the guided assistant at /chat.
--
-- Two tables rather than one. A session is written once, when the customer
-- sends the basket for review; feedback can arrive afterwards, can arrive
-- without a basket at all, and a customer may change their mind and rate it
-- again. Folding the rating into the session row would have meant updating a
-- record that is supposed to be a record of what happened.
--
-- Nothing in here is an order. status stays 'pending_review' because there is
-- no code path in the project that confirms a sale.
create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  visitor_id text not null,
  lang text not null check (lang in ('es', 'en')),
  intake jsonb,
  turns integer not null default 0,
  guardrail_hits integer not null default 0,
  basket jsonb not null default '[]'::jsonb,
  total_mxn integer not null default 0,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'contacted', 'closed'))
);

create index if not exists chat_sessions_created_at_idx on chat_sessions (created_at desc);

create table if not exists chat_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid references chat_sessions (id) on delete set null,
  visitor_id text not null,
  rating text not null check (rating in ('up', 'down')),
  note text
);

create index if not exists chat_feedback_created_at_idx on chat_feedback (created_at desc);

create table core_outputs (
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

create index core_outputs_created_at_idx on core_outputs (created_at desc);

create table orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_label text,
  basket jsonb not null,
  subtotal_mxn numeric not null,
  item_count integer not null,
  status text not null default 'pending_review',
  transcript jsonb
);

create table research_records (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null,
  category text not null,
  note text not null
);

create index orders_created_at_idx on orders (created_at desc);
create index research_records_created_at_idx on research_records (created_at desc);

create table orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_label text,
  basket jsonb not null,
  subtotal_mxn numeric not null,
  item_count integer not null,
  status text not null default 'pending_review',
  transcript jsonb
);

create table research_records (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null,
  category text not null,
  note text not null
);

create index orders_created_at_idx on orders (created_at desc);
create index research_records_created_at_idx on research_records (created_at desc);

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

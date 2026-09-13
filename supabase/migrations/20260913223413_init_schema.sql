-- Outfit Studio initial schema.
-- No auth in this iteration (single-tenant demo): RLS allows public read on
-- everything, and there are intentionally no anon insert/update/delete
-- policies -- all writes go through the service-role client in server
-- actions/route handlers.

create type clothing_category as enum ('top', 'bottom', 'shoes');

create table clothing_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  name text,
  category clothing_category not null,
  subcategory text,

  primary_color text not null,
  secondary_color text,
  pattern text, -- e.g. 'solid', 'striped', 'plaid', 'floral', 'graphic' (free text, Claude-reported)

  casualness smallint not null check (casualness between 1 and 10),
  trendiness smallint not null check (trendiness between 1 and 10),
  boldness smallint not null check (boldness between 1 and 10),
  warmth smallint not null check (warmth between 1 and 10),

  image_path text not null,
  source text not null default 'upload',
  ai_raw_response jsonb, -- raw Claude vision response, for debugging/audit only (not read by the app)
  is_archived boolean not null default false
);

create index idx_clothing_items_category on clothing_items (category);
create index idx_clothing_items_is_archived on clothing_items (is_archived);

create table outfits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  notes text,
  generation_constraints jsonb
);

create table outfit_items (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references outfits (id) on delete cascade,
  clothing_item_id uuid not null references clothing_items (id) on delete cascade,
  unique (outfit_id, clothing_item_id)
);

create index idx_outfit_items_outfit_id on outfit_items (outfit_id);
create index idx_outfit_items_clothing_item_id on outfit_items (clothing_item_id);

insert into storage.buckets (id, name, public)
values ('clothing-photos', 'clothing-photos', true)
on conflict (id) do nothing;

alter table clothing_items enable row level security;
alter table outfits enable row level security;
alter table outfit_items enable row level security;

create policy "public read clothing_items" on clothing_items for select using (true);
create policy "public read outfits" on outfits for select using (true);
create policy "public read outfit_items" on outfit_items for select using (true);

create policy "public read clothing-photos" on storage.objects for select
  using (bucket_id = 'clothing-photos');

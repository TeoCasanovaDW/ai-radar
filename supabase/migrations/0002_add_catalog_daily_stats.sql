-- 1. Create aggregate table
create table public.catalog_daily_stats (
  stat_date                  date primary key,
  model_count                integer not null,
  new_models                 integer not null,
  expired_models             integer not null,
  main_provider_model_count  integer not null,
  created_at                 timestamptz default now(),
  updated_at                 timestamptz default now()
);

alter table public.catalog_daily_stats enable row level security;

create policy "public_select_catalog_daily_stats"
  on public.catalog_daily_stats
  for select
  to public
  using (true);

-- 2. Make raw_json nullable so future snapshots can omit it
alter table public.model_snapshots
  alter column raw_json drop not null;

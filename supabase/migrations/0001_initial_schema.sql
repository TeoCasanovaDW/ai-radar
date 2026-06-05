-- ============================================================
-- models
-- Stores the latest normalized state of each OpenRouter model.
-- ============================================================
create table models (
  id                            uuid primary key default gen_random_uuid(),
  openrouter_id                 text not null unique,
  canonical_slug                text,
  provider                      text not null,
  name                          text not null,
  description                   text,
  created_at_openrouter         timestamptz,
  context_length                integer,
  tokenizer                     text,
  input_modalities              text[] not null default '{}',
  output_modalities             text[] not null default '{}',
  supported_parameters          text[] not null default '{}',
  prompt_price_per_token        numeric,
  completion_price_per_token    numeric,
  prompt_price_per_million      numeric,
  completion_price_per_million  numeric,
  cache_read_price_per_token    numeric,
  cache_write_price_per_token   numeric,
  max_completion_tokens         integer,
  is_moderated                  boolean not null default false,
  expiration_date               timestamptz,
  is_free                       boolean not null default false,
  supports_tools                boolean not null default false,
  supports_structured_outputs   boolean not null default false,
  is_multimodal                 boolean not null default false,
  details_url                   text,
  raw_json                      jsonb not null default '{}',
  last_seen_at                  timestamptz not null default now(),
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now()
);

-- unique constraint on openrouter_id creates its index automatically
create index idx_models_provider                    on models (provider);
create index idx_models_is_free                     on models (is_free);
create index idx_models_is_multimodal               on models (is_multimodal);
create index idx_models_supports_tools              on models (supports_tools);
create index idx_models_supports_structured_outputs on models (supports_structured_outputs);

alter table models enable row level security;

create policy "public_select_models"
  on models for select
  using (true);


-- ============================================================
-- model_snapshots
-- Stores daily historical snapshots. One row per model per day.
-- ============================================================
create table model_snapshots (
  id                            uuid primary key default gen_random_uuid(),
  model_id                      uuid not null references models (id) on delete cascade,
  snapshot_date                 date not null,
  context_length                integer,
  prompt_price_per_token        numeric,
  completion_price_per_token    numeric,
  prompt_price_per_million      numeric,
  completion_price_per_million  numeric,
  input_modalities              text[] not null default '{}',
  output_modalities             text[] not null default '{}',
  supported_parameters          text[] not null default '{}',
  is_free                       boolean not null default false,
  supports_tools                boolean not null default false,
  supports_structured_outputs   boolean not null default false,
  is_multimodal                 boolean not null default false,
  expiration_date               timestamptz,
  raw_json                      jsonb not null default '{}',
  created_at                    timestamptz not null default now(),

  constraint uq_model_snapshots_model_date unique (model_id, snapshot_date)
);

create index idx_model_snapshots_model_id      on model_snapshots (model_id);
create index idx_model_snapshots_snapshot_date on model_snapshots (snapshot_date);

alter table model_snapshots enable row level security;

create policy "public_select_model_snapshots"
  on model_snapshots for select
  using (true);


-- ============================================================
-- sync_runs
-- Tracks data update jobs.
-- error_message must never contain secrets, API keys, or raw
-- environment values.
-- ============================================================
create table sync_runs (
  id                uuid primary key default gen_random_uuid(),
  started_at        timestamptz not null default now(),
  finished_at       timestamptz,
  status            text not null check (status in ('running', 'success', 'failed')),
  models_fetched    integer,
  models_created    integer,
  models_updated    integer,
  snapshots_created integer,
  error_message     text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_sync_runs_status     on sync_runs (status);
create index idx_sync_runs_started_at on sync_runs (started_at);

alter table sync_runs enable row level security;

create policy "public_select_sync_runs"
  on sync_runs for select
  using (true);

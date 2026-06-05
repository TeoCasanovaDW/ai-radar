export interface Model {
  id: string;
  openrouter_id: string;
  canonical_slug: string | null;
  provider: string;
  name: string;
  description: string | null;
  created_at_openrouter: string | null;
  context_length: number | null;
  tokenizer: string | null;
  input_modalities: string[];
  output_modalities: string[];
  supported_parameters: string[];
  prompt_price_per_token: string | null;
  completion_price_per_token: string | null;
  prompt_price_per_million: string | null;
  completion_price_per_million: string | null;
  cache_read_price_per_token: string | null;
  cache_write_price_per_token: string | null;
  max_completion_tokens: number | null;
  is_moderated: boolean;
  expiration_date: string | null;
  is_free: boolean;
  supports_tools: boolean;
  supports_structured_outputs: boolean;
  is_multimodal: boolean;
  details_url: string | null;
  raw_json: Record<string, unknown>;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface ModelSnapshot {
  id: string;
  model_id: string;
  snapshot_date: string;
  context_length: number | null;
  prompt_price_per_token: string | null;
  completion_price_per_token: string | null;
  prompt_price_per_million: string | null;
  completion_price_per_million: string | null;
  input_modalities: string[];
  output_modalities: string[];
  supported_parameters: string[];
  is_free: boolean;
  supports_tools: boolean;
  supports_structured_outputs: boolean;
  is_multimodal: boolean;
  expiration_date: string | null;
  raw_json: Record<string, unknown>;
  created_at: string;
}

export interface SyncRun {
  id: string;
  started_at: string;
  finished_at: string | null;
  status: "running" | "success" | "failed";
  models_fetched: number | null;
  models_created: number | null;
  models_updated: number | null;
  snapshots_created: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

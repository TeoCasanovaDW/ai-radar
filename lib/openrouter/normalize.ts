import type { OpenRouterRawModel } from './types';

function splitModalities(value: string | undefined): string[] {
  const modalities = value?.split("+").filter(Boolean) ?? [];
  return modalities.length > 0 ? modalities : ["text"];
}

function parseModalitiesFromModality(modality: string): { input: string[]; output: string[] } {
  const [inputRaw, outputRaw] = modality.split("->");

  return {
    input: splitModalities(inputRaw),
    output: splitModalities(outputRaw),
  };
}

// Converts a per-token price string into a per-1M-token price.
// Uses Number for readability. The result is rounded to 12 decimals
// and trailing zeros are removed for cleaner display/storage.
function pricePerMillion(raw: string | null | undefined): string | null {
  if (!raw) return null;

  const value = Number(raw);
  if (!Number.isFinite(value)) return null;

  return (value * 1_000_000)
    .toFixed(12)
    .replace(/\.?0+$/, '');
}

// Returns true only if the value is present and parses as exactly zero.
function isZeroPrice(raw: string | null | undefined): boolean {
  if (raw == null) return false;

  const value = Number(raw);
  return Number.isFinite(value) && value === 0;
}

export interface NormalizedModel {
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
  is_moderated: boolean | null;
  expiration_date: string | null;
  is_free: boolean;
  supports_tools: boolean;
  supports_structured_outputs: boolean;
  is_multimodal: boolean;
  details_url: string | null;
  raw_json: Record<string, unknown>;
  last_seen_at: string;
}

export function normalizeModel(raw: OpenRouterRawModel): NormalizedModel {
  const inputModalities: string[] =
    raw.architecture?.input_modalities ??
    (raw.architecture?.modality
      ? parseModalitiesFromModality(raw.architecture.modality).input
      : ['text']);

  const outputModalities: string[] =
    raw.architecture?.output_modalities ??
    (raw.architecture?.modality
      ? parseModalitiesFromModality(raw.architecture.modality).output
      : ['text']);

  const supportedParams = raw.supported_parameters ?? [];

  return {
    openrouter_id: raw.id,
    canonical_slug: raw.canonical_slug ?? raw.id,
    provider: raw.id.split('/')[0],
    name: raw.name,
    description: raw.description ?? null,
    created_at_openrouter:
      raw.created != null ? new Date(raw.created * 1000).toISOString() : null,
    context_length: raw.context_length ?? raw.top_provider?.context_length ?? null,
    tokenizer: raw.architecture?.tokenizer ?? null,
    input_modalities: inputModalities,
    output_modalities: outputModalities,
    supported_parameters: supportedParams,
    prompt_price_per_token: raw.pricing?.prompt ?? null,
    completion_price_per_token: raw.pricing?.completion ?? null,
    prompt_price_per_million: pricePerMillion(raw.pricing?.prompt),
    completion_price_per_million: pricePerMillion(raw.pricing?.completion),
    cache_read_price_per_token: raw.pricing?.input_cache_read ?? null,
    cache_write_price_per_token: raw.pricing?.input_cache_write ?? null,
    max_completion_tokens: raw.top_provider?.max_completion_tokens ?? null,
    is_moderated: raw.top_provider?.is_moderated ?? null,
    expiration_date: raw.expiration_date ?? null,
    is_free: isZeroPrice(raw.pricing?.prompt) && isZeroPrice(raw.pricing?.completion),
    supports_tools: supportedParams.includes('tools'),
    supports_structured_outputs: supportedParams.includes('structured_outputs'),
    is_multimodal:
      inputModalities.some(m => m !== 'text') || outputModalities.some(m => m !== 'text'),
    details_url: raw.links?.details ?? null,
    raw_json: raw as unknown as Record<string, unknown>,
    last_seen_at: new Date().toISOString(),
  };
}

export function normalizeModels(raws: OpenRouterRawModel[]): NormalizedModel[] {
  return raws.map(normalizeModel);
}

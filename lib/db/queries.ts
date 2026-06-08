import { createServerClient } from './supabase';
import type { Model, ModelSnapshot, SyncRun } from './types';
import { MAIN_PROVIDER_VARIANTS, isMainProvider, normalizeProvider } from '../constants/providers';

export type DashboardModelMetric = {
  name: string
  provider: string
  openrouter_id: string
  value: number
}

export type DashboardMetrics = {
  mainProviderModelCount: number
  totalTrackedModels: number
  mainProviderCount: number
  cheapestInputModel: DashboardModelMetric | null
  cheapestOutputModel: DashboardModelMetric | null
  largestContextModel: DashboardModelMetric | null
  multimodalCount: number
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createServerClient();

  const [
    { count: mainProviderModelCount },
    { count: totalTrackedModels },
    { data: mainProviderRows },
    { data: cheapestInputRows },
    { data: cheapestOutputRows },
    { data: largestContextRows },
    { count: multimodalCount },
  ] = await Promise.all([
    supabase
      .from('models')
      .select('id', { count: 'exact', head: true })
      .in('provider', MAIN_PROVIDER_VARIANTS),
    supabase
      .from('models')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('models')
      .select('provider')
      .in('provider', MAIN_PROVIDER_VARIANTS),
    supabase
      .from('models')
      .select('name, provider, openrouter_id, prompt_price_per_million')
      .in('provider', MAIN_PROVIDER_VARIANTS)
      .gt('prompt_price_per_million', 0)
      .order('prompt_price_per_million', { ascending: true })
      .limit(1),
    supabase
      .from('models')
      .select('name, provider, openrouter_id, completion_price_per_million')
      .in('provider', MAIN_PROVIDER_VARIANTS)
      .gt('completion_price_per_million', 0)
      .order('completion_price_per_million', { ascending: true })
      .limit(1),
    supabase
      .from('models')
      .select('name, provider, openrouter_id, context_length')
      .in('provider', MAIN_PROVIDER_VARIANTS)
      .order('context_length', { ascending: false })
      .limit(1),
    supabase
      .from('models')
      .select('id', { count: 'exact', head: true })
      .in('provider', MAIN_PROVIDER_VARIANTS)
      .eq('is_multimodal', true),
  ]);

  const uniqueProviders = new Set(mainProviderRows?.map((r) => normalizeProvider(r.provider)) ?? []);

  const cheapestInput = cheapestInputRows?.[0] ?? null;
  const cheapestOutput = cheapestOutputRows?.[0] ?? null;
  const largestContext = largestContextRows?.[0] ?? null;

  return {
    mainProviderModelCount: mainProviderModelCount ?? 0,
    totalTrackedModels: totalTrackedModels ?? 0,
    mainProviderCount: uniqueProviders.size,
    cheapestInputModel: cheapestInput
      ? { name: cheapestInput.name, provider: cheapestInput.provider, openrouter_id: cheapestInput.openrouter_id, value: cheapestInput.prompt_price_per_million }
      : null,
    cheapestOutputModel: cheapestOutput
      ? { name: cheapestOutput.name, provider: cheapestOutput.provider, openrouter_id: cheapestOutput.openrouter_id, value: cheapestOutput.completion_price_per_million }
      : null,
    largestContextModel: largestContext
      ? { name: largestContext.name, provider: largestContext.provider, openrouter_id: largestContext.openrouter_id, value: largestContext.context_length }
      : null,
    multimodalCount: multimodalCount ?? 0,
  };
}

export async function getAllModels(): Promise<Model[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('models')
    .select('*')
    .order('provider', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch models: ${error.message}`);
  }

  return data ?? [];
}

export async function getModelById(id: string): Promise<Model | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('id', id)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch model: ${error.message}`);
  }

  return data;
}

export async function getLatestModelSnapshot(modelId: string): Promise<ModelSnapshot | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('model_snapshots')
    .select('*')
    .eq('model_id', modelId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch model snapshot: ${error.message}`);
  }

  return data;
}

export async function getLatestSuccessfulSyncRun(): Promise<SyncRun | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('sync_runs')
    .select('*')
    .eq('status', 'success')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch latest sync run: ${error.message}`);
  }

  return data;
}

export type PriceChartData = { name: string; input: number; output: number };

export async function getPriceChartData(): Promise<PriceChartData[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('models')
    .select('name, provider, prompt_price_per_million, completion_price_per_million')
    .not('prompt_price_per_million', 'is', null)
    .not('completion_price_per_million', 'is', null);

  if (error) throw new Error(`Failed to fetch price chart data: ${error.message}`);

  return (data ?? [])
    .filter((r) => isMainProvider(r.provider))
    .filter((r) => parseFloat(r.completion_price_per_million) > 0 && parseFloat(r.prompt_price_per_million) > 0)
    .sort((a, b) => parseFloat(b.completion_price_per_million) - parseFloat(a.completion_price_per_million))
    .slice(0, 10)
    .map((r) => ({
      name: r.name,
      input: parseFloat(r.prompt_price_per_million),
      output: parseFloat(r.completion_price_per_million),
    }));
}

export type ContextChartData = { name: string; context_length: number };

export async function getContextChartData(): Promise<ContextChartData[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('models')
    .select('name, provider, context_length')
    .not('context_length', 'is', null);

  if (error) throw new Error(`Failed to fetch context chart data: ${error.message}`);

  return (data ?? [])
    .filter((r) => isMainProvider(r.provider))
    .sort((a, b) => b.context_length - a.context_length)
    .slice(0, 10)
    .map((r) => ({ name: r.name, context_length: r.context_length }));
}

export type PriceVsContextData = { name: string; price: number; context: number };

export async function getPriceVsContextData(): Promise<PriceVsContextData[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('models')
    .select('name, provider, completion_price_per_million, context_length')
    .not('completion_price_per_million', 'is', null)
    .not('context_length', 'is', null);

  if (error) throw new Error(`Failed to fetch price vs context data: ${error.message}`);

  return (data ?? [])
    .filter((r) => isMainProvider(r.provider))
    .filter((r) => parseFloat(r.completion_price_per_million) > 0)
    .filter((r) => parseFloat(r.completion_price_per_million) <= 200 && r.context_length <= 2_000_000)
    .map((r) => ({
      name: r.name,
      price: parseFloat(r.completion_price_per_million),
      context: r.context_length,
    }));
}

export type ProviderChartData = { provider: string; model_count: number };

export async function getModelsByProviderData(): Promise<ProviderChartData[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('models')
    .select('provider')
    .not('provider', 'is', null);

  if (error) throw new Error(`Failed to fetch provider data: ${error.message}`);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (!isMainProvider(row.provider)) continue;
    const norm = normalizeProvider(row.provider);
    counts.set(norm, (counts.get(norm) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([provider, model_count]) => ({ provider, model_count }))
    .sort((a, b) => b.model_count - a.model_count);
}

export type CatalogEvolutionData = {
  snapshot_date: string;
  model_count: number;
  new_models: number;
  expired_models: number;
};

export async function getCatalogEvolutionData(): Promise<CatalogEvolutionData[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('catalog_daily_stats')
    .select('stat_date, model_count, new_models, expired_models')
    .order('stat_date', { ascending: true });

  if (error) throw new Error(`Failed to fetch catalog evolution data: ${error.message}`);

  return (data ?? []).map(row => ({
    snapshot_date: row.stat_date,
    model_count: row.model_count,
    new_models: row.new_models,
    expired_models: row.expired_models,
  }));
}

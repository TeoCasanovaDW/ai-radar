import { createServerClient } from './supabase';
import type { Model, ModelSnapshot, SyncRun } from './types';
import { MAIN_PROVIDER_VARIANTS } from '../constants/providers';

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

  const uniqueProviders = new Set(mainProviderRows?.map((r) => r.provider) ?? []);

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

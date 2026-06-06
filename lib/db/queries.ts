import { createServerClient } from './supabase';
import type { SyncRun } from './types';
import { MAIN_PROVIDERS } from '../constants/providers';

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
      .in('provider', MAIN_PROVIDERS),
    supabase
      .from('models')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('models')
      .select('provider')
      .in('provider', MAIN_PROVIDERS),
    supabase
      .from('models')
      .select('name, provider, openrouter_id, prompt_price_per_million')
      .in('provider', MAIN_PROVIDERS)
      .gt('prompt_price_per_million', 0)
      .order('prompt_price_per_million', { ascending: true })
      .limit(1),
    supabase
      .from('models')
      .select('name, provider, openrouter_id, completion_price_per_million')
      .in('provider', MAIN_PROVIDERS)
      .gt('completion_price_per_million', 0)
      .order('completion_price_per_million', { ascending: true })
      .limit(1),
    supabase
      .from('models')
      .select('name, provider, openrouter_id, context_length')
      .in('provider', MAIN_PROVIDERS)
      .order('context_length', { ascending: false })
      .limit(1),
    supabase
      .from('models')
      .select('id', { count: 'exact', head: true })
      .in('provider', MAIN_PROVIDERS)
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

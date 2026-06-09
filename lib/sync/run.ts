import { createServerClient } from '../db/supabase';
import { fetchOpenRouterModels } from '../openrouter/fetch';
import { normalizeModels } from '../openrouter/normalize';
import { isMainProvider } from '../constants/providers';

export interface SyncResult {
  models_fetched: number;
  models_created: number;
  models_updated: number;
  snapshots_created: number;
}

function sanitizeErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.slice(0, 1000);
}

export async function runSync(): Promise<SyncResult> {
  const supabase = createServerClient();
  const startedAt = new Date().toISOString();
  const snapshotDate = startedAt.slice(0, 10); // UTC YYYY-MM-DD

  const { data: syncRunRow, error: syncRunError } = await supabase
    .from('sync_runs')
    .insert({ status: 'running', started_at: startedAt, updated_at: startedAt })
    .select('id')
    .single();

  if (syncRunError || !syncRunRow) {
    throw new Error(`Failed to create sync_runs row: ${syncRunError?.message}`);
  }

  const syncRunId: string = syncRunRow.id;

  try {
    const { models: rawModels } = await fetchOpenRouterModels();
    const normalized = normalizeModels(rawModels);
    const models_fetched = normalized.length;

    const { data: existingRows, error: existingError } = await supabase
      .from('models')
      .select('openrouter_id');

    if (existingError) {
      throw new Error(`Failed to fetch existing models: ${existingError.message}`);
    }

    const existingIds = new Set(
      (existingRows ?? []).map((r: { openrouter_id: string }) => r.openrouter_id)
    );
    const models_created = normalized.filter(m => !existingIds.has(m.openrouter_id)).length;
    const models_updated = normalized.filter(m => existingIds.has(m.openrouter_id)).length;

    const updatedAt = new Date().toISOString();
    const modelRows = normalized.map(m => ({ ...m, updated_at: updatedAt }));

    const { data: upsertedModels, error: upsertError } = await supabase
      .from('models')
      .upsert(modelRows, { onConflict: 'openrouter_id' })
      .select('id, openrouter_id');

    if (upsertError || !upsertedModels) {
      throw new Error(`Failed to upsert models: ${upsertError?.message}`);
    }

    const idMap = new Map<string, string>(
      upsertedModels.map((r: { id: string; openrouter_id: string }) => [r.openrouter_id, r.id])
    );

    const snapshotRows = normalized
      .map(m => {
        const model_id = idMap.get(m.openrouter_id);
        if (!model_id) return null;
        return {
          model_id,
          snapshot_date: snapshotDate,
          context_length: m.context_length,
          prompt_price_per_token: m.prompt_price_per_token,
          completion_price_per_token: m.completion_price_per_token,
          prompt_price_per_million: m.prompt_price_per_million,
          completion_price_per_million: m.completion_price_per_million,
          input_modalities: m.input_modalities,
          output_modalities: m.output_modalities,
          supported_parameters: m.supported_parameters,
          is_free: m.is_free,
          supports_tools: m.supports_tools,
          supports_structured_outputs: m.supports_structured_outputs,
          is_multimodal: m.is_multimodal,
          expiration_date: m.expiration_date,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    const { data: insertedSnapshots, error: snapshotError } = await supabase
      .from('model_snapshots')
      .upsert(snapshotRows, { onConflict: 'model_id,snapshot_date', ignoreDuplicates: true })
      .select('id');

    if (snapshotError) {
      throw new Error(`Failed to insert snapshots: ${snapshotError.message}`);
    }

    const snapshots_created = (insertedSnapshots ?? []).length;

    // Compute and upsert daily stats
    const mainProviderModelCount = normalized.filter(m => isMainProvider(m.provider)).length;
    const expiredCount = normalized.filter(
      m => m.expiration_date != null && m.expiration_date <= snapshotDate
    ).length;

    const { data: statsData, error: statsError } = await supabase
      .from('catalog_daily_stats')
      .upsert(
        {
          stat_date: snapshotDate,
          model_count: normalized.length,
          new_models: models_created,
          expired_models: expiredCount,
          main_provider_model_count: mainProviderModelCount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'stat_date' }
      )
      .select('stat_date')
      .single();

    if (statsError) {
      throw new Error(`Failed to upsert catalog_daily_stats: ${statsError.message}`);
    }
    if (!statsData || statsData.stat_date !== snapshotDate) {
      throw new Error(`catalog_daily_stats was not written for date ${snapshotDate}`);
    }

    // Retention: delete model_snapshots older than 90 days
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - 90);
    const cutoffDate = cutoff.toISOString().slice(0, 10);

    const { error: retentionError } = await supabase
      .from('model_snapshots')
      .delete()
      .lt('snapshot_date', cutoffDate);

    if (retentionError) {
      throw new Error(`Failed to delete old snapshots: ${retentionError.message}`);
    }

    const finishedAt = new Date().toISOString();

    await supabase
      .from('sync_runs')
      .update({
        status: 'success',
        finished_at: finishedAt,
        models_fetched,
        models_created,
        models_updated,
        snapshots_created,
        updated_at: finishedAt,
      })
      .eq('id', syncRunId);

    return { models_fetched, models_created, models_updated, snapshots_created };
  } catch (error) {
    const finishedAt = new Date().toISOString();
    await supabase
      .from('sync_runs')
      .update({
        status: 'failed',
        finished_at: finishedAt,
        error_message: sanitizeErrorMessage(error),
        updated_at: finishedAt,
      })
      .eq('id', syncRunId);

    throw error;
  }
}

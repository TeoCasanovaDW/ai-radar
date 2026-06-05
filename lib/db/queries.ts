import { createServerClient } from './supabase';
import type { SyncRun } from './types';

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

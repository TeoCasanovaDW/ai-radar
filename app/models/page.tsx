export const dynamic = 'force-dynamic';

import { getAllModels } from '@/lib/db/queries';
import { ModelsTable } from '@/components/models/models-table';

export default async function ModelsPage() {
  let models;
  try {
    models = await getAllModels();
  } catch {
    return (
      <main className="p-8">
        <h1 className="mb-6 text-2xl font-semibold">Models</h1>
        <p className="text-sm text-muted-foreground">Failed to load models.</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Models</h1>
        <span className="text-sm text-muted-foreground">{models.length} models tracked</span>
      </div>
      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        This table shows models from OpenRouter. By default, only main providers are displayed to
        keep comparison readable. Prices are shown per 1M tokens. Providers prefixed with{' '}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">~</code>, such as{' '}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">~anthropic</code> or{' '}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">~openai</code>, are
        OpenRouter-routed variants and are grouped with their main provider for filtering.
      </p>
      <ModelsTable models={models} />
    </main>
  );
}

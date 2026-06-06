export const dynamic = 'force-dynamic';

import {
  getDashboardMetrics,
  getLatestSuccessfulSyncRun,
  getPriceChartData,
  getContextChartData,
  getPriceVsContextData,
  getModelsByProviderData,
  getCatalogEvolutionData,
} from '@/lib/db/queries';
import { MetricCard } from '@/components/dashboard/metric-card';
import { PriceChart } from '@/components/charts/price-chart';
import { ContextChart } from '@/components/charts/context-chart';
import { PriceVsContextChart } from '@/components/charts/price-vs-context-chart';
import { ProviderChart } from '@/components/charts/provider-chart';
import { EvolutionChart } from '@/components/charts/evolution-chart';

function formatPrice(value: number): string {
  return `$${Number(value).toFixed(2)} / 1M tokens`;
}

function formatContextLength(value: number): string {
  return value.toLocaleString();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function DashboardPage() {
  const [metrics, syncRun, priceData, contextData, priceVsContextData, providerData, evolutionData] = await Promise.all([
    getDashboardMetrics(),
    getLatestSuccessfulSyncRun(),
    getPriceChartData(),
    getContextChartData(),
    getPriceVsContextData(),
    getModelsByProviderData(),
    getCatalogEvolutionData(),
  ]);

  const {
    mainProviderModelCount,
    totalTrackedModels,
    mainProviderCount,
    cheapestInputModel,
    cheapestOutputModel,
    largestContextModel,
    multimodalCount,
  } = metrics;

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <MetricCard
          label="Main provider models"
          value={mainProviderModelCount}
          sublabel={`${totalTrackedModels} total tracked`}
        />
        <MetricCard
          label="Main providers"
          value={mainProviderCount}
        />
        <MetricCard
          label="Cheapest input"
          value={cheapestInputModel ? formatPrice(cheapestInputModel.value) : '—'}
          sublabel={cheapestInputModel?.name}
        />
        <MetricCard
          label="Cheapest output"
          value={cheapestOutputModel ? formatPrice(cheapestOutputModel.value) : '—'}
          sublabel={cheapestOutputModel?.name}
        />
        <MetricCard
          label="Largest context"
          value={largestContextModel ? formatContextLength(largestContextModel.value) : '—'}
          sublabel={largestContextModel?.name}
        />
        <MetricCard
          label="Multimodal models"
          value={multimodalCount}
        />
        <MetricCard
          label="Last successful sync"
          value={syncRun ? formatDate(syncRun.started_at) : '—'}
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-medium">Latest successful sync</h2>
        {syncRun ? (
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Date: {formatDate(syncRun.started_at)}</p>
            <p>Models fetched: {syncRun.models_fetched ?? '—'}</p>
            <p>Models created: {syncRun.models_created ?? '—'}</p>
            <p>Models updated: {syncRun.models_updated ?? '—'}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </section>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PriceChart data={priceData} />
        <ContextChart data={contextData} />
        <PriceVsContextChart data={priceVsContextData} />
        <ProviderChart data={providerData} />
        <div className="lg:col-span-2">
          <EvolutionChart data={evolutionData} />
        </div>
      </div>
    </main>
  );
}

'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartCard } from './chart-card';
import type { CatalogEvolutionData } from '@/lib/db/queries';

type Props = { data: CatalogEvolutionData[] };

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function EvolutionChart({ data }: Props) {
  const formatted = data.map((d) => ({ ...d, label: formatDate(d.snapshot_date) }));

  return (
    <ChartCard
      title="Catalog Evolution"
      description="Daily count of tracked models based on snapshot history."
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" minHeight={300}>
        <LineChart data={formatted} margin={{ left: 8, right: 16, bottom: 8 }}>
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis label={{ value: 'models', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="model_count" name="Total models" stroke="#6366f1" dot={data.length === 1} />
          <Line type="monotone" dataKey="new_models" name="New models" stroke="#22c55e" dot={data.length === 1} />
          <Line type="monotone" dataKey="expired_models" name="Expired models" stroke="#f59e0b" dot={data.length === 1} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

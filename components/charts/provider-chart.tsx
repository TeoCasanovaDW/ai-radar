'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartCard } from './chart-card';
import type { ProviderChartData } from '@/lib/db/queries';

type Props = { data: ProviderChartData[] };

export function ProviderChart({ data }: Props) {
  return (
    <ChartCard
      title="Models by Provider"
      description="Number of models per provider in the current catalog."
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" minHeight={300}>
        <BarChart data={data} margin={{ left: 8, right: 8, bottom: 8 }}>
          <XAxis dataKey="provider" tick={{ fontSize: 11 }} />
          <YAxis label={{ value: 'models', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Bar dataKey="model_count" name="Models" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartCard } from './chart-card';
import type { PriceChartData } from '@/lib/db/queries';

type Props = { data: PriceChartData[] };

export function PriceChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    name: d.name.length > 20 ? d.name.slice(0, 20) + '…' : d.name,
  }));

  return (
    <ChartCard
      title="Input / Output Price by Model"
      description="Prompt and completion prices per 1M tokens. Free models excluded."
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" minHeight={300}>
        <BarChart layout="vertical" data={formatted} margin={{ left: 16, right: 16 }}>
          <XAxis type="number" unit=" $" label={{ value: '$ / 1M tokens', position: 'insideBottom', offset: -4 }} />
          <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => (typeof v === 'number' ? `$${v}` : v)} />
          <Legend />
          <Bar dataKey="input" name="Input" fill="#6366f1" />
          <Bar dataKey="output" name="Output" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

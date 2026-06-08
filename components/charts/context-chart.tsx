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
import { Badge } from '@/components/ui/badge';
import type { ContextChartData } from '@/lib/db/queries';

type Props = { data: ContextChartData[] };

export function ContextChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    name: d.name.length > 25 ? d.name.slice(0, 25) + '…' : d.name,
  }));

  return (
    <ChartCard
      title="Context Length by Model"
      description="Largest context windows in tokens."
      isEmpty={data.length === 0}
      badge={<Badge variant="secondary">Top 10</Badge>}
    >
      <ResponsiveContainer width="100%" minHeight={420}>
        <BarChart layout="vertical" data={formatted} margin={{ left: 16, right: 16 }}>
          <XAxis type="number" label={{ value: 'tokens', position: 'insideBottom', offset: -4 }} />
          <YAxis type="category" dataKey="name" width={190} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => (typeof v === 'number' ? `${v.toLocaleString()} tokens` : v)} />
          <Bar dataKey="context_length" name="Context length" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

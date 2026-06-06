'use client';

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartCard } from './chart-card';
import type { PriceVsContextData } from '@/lib/db/queries';

type Props = { data: PriceVsContextData[] };

type TooltipEntry = { active?: boolean; payload?: Array<{ payload: PriceVsContextData }> };

function CustomTooltip({ active, payload }: TooltipEntry) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded border bg-popover px-3 py-2 text-sm shadow">
      <p className="font-medium">{d.name}</p>
      <p className="text-muted-foreground">Price: ${d.price} / 1M tokens</p>
      <p className="text-muted-foreground">Context: {d.context.toLocaleString()} tokens</p>
    </div>
  );
}

export function PriceVsContextChart({ data }: Props) {
  return (
    <ChartCard
      title="Output Price vs Context Length"
      description="Compares cost efficiency with context size."
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" minHeight={300}>
        <ScatterChart margin={{ left: 16, right: 16, bottom: 24 }}>
          <XAxis
            type="number"
            dataKey="context"
            name="Context"
            label={{ value: 'tokens', position: 'insideBottom', offset: -8 }}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="number"
            dataKey="price"
            name="Price"
            label={{ value: '$ / 1M tokens', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={data} fill="#6366f1" />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

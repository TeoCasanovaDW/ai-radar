'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from '@/components/ui/card';

type ChartCardProps = {
  title: string;
  description: string;
  isEmpty: boolean;
  children: React.ReactNode;
  badge?: React.ReactNode;
};

export function ChartCard({ title, description, isEmpty, children, badge }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {badge && <CardAction>{badge}</CardAction>}
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <p className="text-muted-foreground text-sm">No data available.</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

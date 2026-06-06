'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

type ChartCardProps = {
  title: string;
  description: string;
  isEmpty: boolean;
  children: React.ReactNode;
};

export function ChartCard({ title, description, isEmpty, children }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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

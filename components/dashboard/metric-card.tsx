import { Card, CardHeader, CardContent } from '@/components/ui/card';

type MetricCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
};

export function MetricCard({ label, value, sublabel }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
        {sublabel && (
          <p className="mt-1 text-sm text-muted-foreground">{sublabel}</p>
        )}
      </CardContent>
    </Card>
  );
}

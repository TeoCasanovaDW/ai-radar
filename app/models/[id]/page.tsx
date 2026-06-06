import Link from "next/link";
import { notFound } from "next/navigation";
import { getModelById, getLatestModelSnapshot } from "@/lib/db/queries";
import { DetailRow } from "@/components/model-detail/detail-row";
import { RawJsonCollapsible } from "@/components/model-detail/raw-json";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function fmt(value: string | null | undefined): string {
  return value ?? "—";
}

function fmtDate(value: string | null | undefined): string {
  if (!value) return "—";
  return value.slice(0, 10);
}

function fmtPrice(value: string | null | undefined): string {
  if (!value) return "—";
  return `$${value}`;
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardHeader>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = await getModelById(id);
  if (!model) notFound();

  const snapshot = await getLatestModelSnapshot(model.id);

  return (
    <main className="p-8">
      {/* Back link */}
      <Link
        href="/models"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to models
      </Link>

      {/* Header */}
      <div className="mb-8 mt-4">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{model.name}</h1>
          <Badge variant="secondary">{model.provider}</Badge>
          {model.is_free && <Badge variant="outline">Free</Badge>}
        </div>
        <p className="mb-2 font-mono text-xs text-muted-foreground">
          {model.openrouter_id}
        </p>
        {model.description && (
          <p className="max-w-2xl text-sm text-muted-foreground">
            {model.description}
          </p>
        )}
      </div>

      {/* Key metrics */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          label="Input / 1M tokens"
          value={fmtPrice(model.prompt_price_per_million)}
        />
        <StatTile
          label="Output / 1M tokens"
          value={fmtPrice(model.completion_price_per_million)}
        />
        <StatTile
          label="Context length"
          value={model.context_length?.toLocaleString() ?? "—"}
        />
        <StatTile
          label="Max output tokens"
          value={model.max_completion_tokens?.toLocaleString() ?? "—"}
        />
      </div>

      {/* Detail cards — 2-col grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionCard title="Pricing">
          <DetailRow
            label="Input (per token)"
            value={fmtPrice(model.prompt_price_per_token)}
          />
          <DetailRow
            label="Input (per 1M tokens)"
            value={fmtPrice(model.prompt_price_per_million)}
          />
          <DetailRow
            label="Output (per token)"
            value={fmtPrice(model.completion_price_per_token)}
          />
          <DetailRow
            label="Output (per 1M tokens)"
            value={fmtPrice(model.completion_price_per_million)}
          />
          {model.cache_read_price_per_token && (
            <DetailRow
              label="Cache read (per token)"
              value={fmtPrice(model.cache_read_price_per_token)}
            />
          )}
          {model.cache_write_price_per_token && (
            <DetailRow
              label="Cache write (per token)"
              value={fmtPrice(model.cache_write_price_per_token)}
            />
          )}
        </SectionCard>

        <SectionCard title="Modalities">
          <DetailRow
            label="Input"
            value={
              model.input_modalities.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {model.input_modalities.map((m) => (
                    <Badge key={m} variant="outline">
                      {m}
                    </Badge>
                  ))}
                </div>
              ) : (
                "—"
              )
            }
          />
          <DetailRow
            label="Output"
            value={
              model.output_modalities.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {model.output_modalities.map((m) => (
                    <Badge key={m} variant="outline">
                      {m}
                    </Badge>
                  ))}
                </div>
              ) : (
                "—"
              )
            }
          />
        </SectionCard>

        <SectionCard title="Capabilities">
          <DetailRow
            label="Tool use"
            value={model.supports_tools ? "Yes" : "No"}
          />
          <DetailRow
            label="Structured outputs"
            value={model.supports_structured_outputs ? "Yes" : "No"}
          />
          <DetailRow
            label="Moderation"
            value={model.is_moderated ? "Moderated" : "Unmoderated"}
          />
          <DetailRow
            label="Multimodal"
            value={model.is_multimodal ? "Yes" : "No"}
          />
        </SectionCard>

        <SectionCard title="Parameters">
          <DetailRow
            label="Supported parameters"
            value={
              model.supported_parameters.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {model.supported_parameters.map((p) => (
                    <Badge
                      key={p}
                      variant={
                        p === "tools" || p === "structured_outputs"
                          ? "default"
                          : "outline"
                      }
                    >
                      {p}
                    </Badge>
                  ))}
                </div>
              ) : (
                "—"
              )
            }
          />
        </SectionCard>

        <SectionCard title="Context">
          <DetailRow
            label="Context length"
            value={model.context_length?.toLocaleString() ?? "—"}
          />
          <DetailRow
            label="Max completion tokens"
            value={model.max_completion_tokens?.toLocaleString() ?? "—"}
          />
        </SectionCard>

        <SectionCard title="Metadata">
          <DetailRow label="OpenRouter ID" value={fmt(model.openrouter_id)} />
          <DetailRow label="Tokenizer" value={fmt(model.tokenizer)} />
          <DetailRow
            label="Expiration date"
            value={fmtDate(model.expiration_date)}
          />
          <DetailRow label="Last seen" value={fmtDate(model.last_seen_at)} />
          <DetailRow
            label="Latest snapshot"
            value={snapshot ? fmtDate(snapshot.snapshot_date) : "—"}
          />
        </SectionCard>
      </div>

      {/* Raw JSON — full width */}
      <SectionCard title="Raw JSON">
        <RawJsonCollapsible json={model.raw_json} />
      </SectionCard>
    </main>
  );
}

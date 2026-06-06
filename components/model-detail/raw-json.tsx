"use client";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

export function RawJsonCollapsible({
  json,
}: {
  json: Record<string, unknown> | null;
}) {
  if (!json) return <span className="text-sm">—</span>;

  return (
    <Collapsible>
      <CollapsibleTrigger className="text-sm text-muted-foreground underline-offset-4 hover:underline">
        Show raw JSON
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="mt-2 max-h-96 overflow-auto rounded-md bg-muted p-4 text-xs">
          {JSON.stringify(json, null, 2)}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}

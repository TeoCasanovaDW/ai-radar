import type { OpenRouterRawModel } from "./types";

export function filterValidModels(raw: OpenRouterRawModel[]): {
  valid: OpenRouterRawModel[];
  skipped: number;
} {
  const valid = raw.filter(
    (m) => typeof m.id === "string" && m.id.length > 0 &&
            typeof m.name === "string" && m.name.length > 0
  );
  return { valid, skipped: raw.length - valid.length };
}

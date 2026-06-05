import type { OpenRouterModelsResponse, OpenRouterRawModel } from "./types";
import { filterValidModels } from "./validate";

const OPENROUTER_MODELS_URL =
  "https://openrouter.ai/api/v1/models?output_modalities=all";

export async function fetchOpenRouterModels(): Promise<{
  models: OpenRouterRawModel[];
  skipped: number;
}> {
  const response = await fetch(OPENROUTER_MODELS_URL);

  if (!response.ok) {
    throw new Error(`OpenRouter fetch failed: ${response.status}`);
  }

  const json: unknown = await response.json();

  if (
    typeof json !== "object" ||
    json === null ||
    !Array.isArray((json as Record<string, unknown>).data)
  ) {
    throw new Error("Invalid OpenRouter response shape");
  }

  const data = json as OpenRouterModelsResponse;
  const { valid: models, skipped } = filterValidModels(data.data);
  return { models, skipped };
}

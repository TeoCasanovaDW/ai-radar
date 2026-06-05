export interface OpenRouterRawModel {
  id: string;
  canonical_slug?: string;
  hugging_face_id?: string;
  name: string;
  created?: number;
  description?: string;
  context_length?: number;
  architecture?: {
    modality?: string;
    input_modalities?: string[];
    output_modalities?: string[];
    tokenizer?: string;
    instruct_type?: string;
  };
  pricing?: {
    prompt?: string;
    completion?: string;
    request?: string;
    image?: string;
    web_search?: string;
    internal_reasoning?: string;
    input_cache_read?: string;
    input_cache_write?: string;
  };
  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
  per_request_limits?: Record<string, string> | null;
  supported_parameters?: string[];
  default_parameters?: Record<string, unknown> | null;
  supported_voices?: string[] | null;
  knowledge_cutoff?: string | null;
  expiration_date?: string | null;
  links?: {
    details?: string;
  };
}

export interface OpenRouterModelsResponse {
  data: OpenRouterRawModel[];
}

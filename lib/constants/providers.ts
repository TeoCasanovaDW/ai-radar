export const MAIN_PROVIDERS = [
  'openai', 'anthropic', 'google', 'mistralai',
  'meta-llama', 'deepseek', 'x-ai', 'qwen',
] as const

export type MainProvider = typeof MAIN_PROVIDERS[number]

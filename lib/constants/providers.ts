export const MAIN_PROVIDERS = [
  'openai', 'anthropic', 'google', 'mistralai',
  'meta-llama', 'deepseek', 'x-ai', 'qwen',
] as const

export type MainProvider = typeof MAIN_PROVIDERS[number]

export const MAIN_PROVIDER_VARIANTS: string[] = [
  ...MAIN_PROVIDERS,
  ...MAIN_PROVIDERS.map((p) => `~${p}`),
]

export function normalizeProvider(provider: string): string {
  return provider.startsWith('~') ? provider.slice(1) : provider
}

export function isMainProvider(provider: string): boolean {
  return (MAIN_PROVIDERS as readonly string[]).includes(normalizeProvider(provider))
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { isMainProvider } from '@/lib/constants/providers'
import { RotateCcwIcon } from 'lucide-react'

function HelpIcon({ title }: { title: string }) {
  return (
    <span
      title={title}
      className="relative -top-1 inline-flex h-3.5 w-3.5 cursor-help select-none items-center justify-center rounded-full bg-slate-400 text-[9px] font-bold leading-none text-white"
    >
      ?
    </span>
  )
}

export type FilterState = {
  search: string
  provider: string
  modality: 'all' | 'text' | 'image' | 'audio'
  tools: boolean
  structuredOutputs: boolean
  freePaid: 'all' | 'free' | 'paid'
  mainProvidersOnly: boolean
}

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  provider: 'all',
  modality: 'all',
  tools: false,
  structuredOutputs: false,
  freePaid: 'all',
  mainProvidersOnly: true,
}

type Props = {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  allProviders: string[]
}

export function TableFilters({ filters, onFiltersChange, allProviders }: Props) {
  const [searchInput, setSearchInput] = useState(filters.search)
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filtersRef.current, search: searchInput })
    }, 200)
    return () => clearTimeout(timer)
  }, [searchInput, onFiltersChange])

  function set<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    onFiltersChange({ ...filters, [key]: value })
  }

  const providerOptions = filters.mainProvidersOnly
    ? allProviders.filter((p) => isMainProvider(p))
    : allProviders

  function reset() {
    setSearchInput('')
    onFiltersChange(DEFAULT_FILTERS)
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
      <p className="text-sm font-medium">Filters</p>

      {/* Row 1 — Search */}
      <Input
        placeholder="Search models..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="max-w-sm"
      />

      {/* Row 2 — Select filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            Provider
            <HelpIcon title="Filter models by OpenRouter provider. Providers prefixed with ~ are routed variants." />
          </span>
          <Select value={filters.provider} onValueChange={(v) => set('provider', v ?? 'all')}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All providers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All providers</SelectItem>
              {providerOptions.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            Modality
            <HelpIcon title="Filter by supported input/output type, such as text, image, audio, or video." />
          </span>
          <Select
            value={filters.modality}
            onValueChange={(v) => set('modality', (v ?? 'all') as FilterState['modality'])}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All modalities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modalities</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            Pricing
            <HelpIcon title="Free models have both input and output prices equal to $0." />
          </span>
          <Select
            value={filters.freePaid}
            onValueChange={(v) => set('freePaid', (v ?? 'all') as FilterState['freePaid'])}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All prices</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 3 — Toggles */}
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Switch
            checked={filters.tools}
            onCheckedChange={(checked) => set('tools', checked)}
          />
          Tools
          <HelpIcon title="Show models that support tool/function calling parameters." />
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Switch
            checked={filters.structuredOutputs}
            onCheckedChange={(checked) => set('structuredOutputs', checked)}
          />
          Structured outputs
          <HelpIcon title="Show models that support constrained or schema-based responses." />
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Switch
            checked={filters.mainProvidersOnly}
            onCheckedChange={(checked) => set('mainProvidersOnly', checked)}
          />
          Main providers
          <HelpIcon title="Show only selected major providers and their routed ~ variants." />
        </label>
      </div>

      <Button variant="outline" size="sm" onClick={reset}>
        <RotateCcwIcon />
        Reset filters
      </Button>
    </div>
  )
}

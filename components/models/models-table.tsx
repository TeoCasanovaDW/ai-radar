'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type Row,
  type SortingState,
  type Table as TanstackTable,
} from '@tanstack/react-table'
import { ChevronDownIcon, ChevronUpIcon, ChevronsUpDownIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { isMainProvider } from '@/lib/constants/providers'
import type { Model } from '@/lib/db/types'
import { DEFAULT_FILTERS, TableFilters, type FilterState } from './table-filters'

const columnHelper = createColumnHelper<Model>()

function formatPrice(value: string | null, isFree: boolean): string {
  if (isFree) return 'Free'
  if (value == null) return '—'
  const num = parseFloat(value)
  return isNaN(num) ? '—' : `$${num.toFixed(2)}`
}

function formatNumber(n: number | null): string {
  if (n == null) return '—'
  return n.toLocaleString()
}

function formatDate(s: string | null): string {
  if (!s) return '—'
  return new Date(s).toLocaleDateString()
}

function priceSort(rowA: Row<Model>, rowB: Row<Model>, columnId: string): number {
  const a = rowA.getValue<string | null>(columnId)
  const b = rowB.getValue<string | null>(columnId)
  const aVal = a == null ? Infinity : parseFloat(a)
  const bVal = b == null ? Infinity : parseFloat(b)
  return aVal - bVal
}

const columns = [
  columnHelper.accessor('name', {
    header: 'Model',
    cell: ({ getValue, row }) => (
      <Link
        href={`/models/${row.original.id}`}
        className="font-medium hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor('provider', {
    header: 'Provider',
  }),
  columnHelper.accessor('context_length', {
    header: 'Context',
    cell: ({ getValue }) => formatNumber(getValue()),
  }),
  columnHelper.accessor('prompt_price_per_million', {
    header: 'Input / 1M',
    sortingFn: priceSort,
    cell: ({ getValue, row }) => formatPrice(getValue(), row.original.is_free),
  }),
  columnHelper.accessor('completion_price_per_million', {
    header: 'Output / 1M',
    sortingFn: priceSort,
    cell: ({ getValue, row }) => formatPrice(getValue(), row.original.is_free),
  }),
  columnHelper.accessor('input_modalities', {
    header: 'Input modalities',
    enableSorting: false,
    cell: ({ getValue }) => (
      <div className="flex flex-wrap gap-1">
        {getValue().map((m) => (
          <Badge key={m} variant="secondary">{m}</Badge>
        ))}
      </div>
    ),
  }),
  columnHelper.accessor('output_modalities', {
    header: 'Output modalities',
    enableSorting: false,
    cell: ({ getValue }) => (
      <div className="flex flex-wrap gap-1">
        {getValue().map((m) => (
          <Badge key={m} variant="secondary">{m}</Badge>
        ))}
      </div>
    ),
  }),
  columnHelper.accessor('supports_tools', {
    header: () => (
      <span title="Model supports tool/function calling parameters.">Tools</span>
    ),
    cell: ({ getValue }) => (getValue() ? '✓' : '—'),
  }),
  columnHelper.accessor('supports_structured_outputs', {
    header: () => (
      <span title="Model supports constrained or schema-based responses when exposed by OpenRouter.">
        Structured
      </span>
    ),
    cell: ({ getValue }) => (getValue() ? '✓' : '—'),
  }),
  columnHelper.accessor('created_at_openrouter', {
    header: () => (
      <span title="Date provided by OpenRouter, not necessarily the official model release date.">
        Catalog date
      </span>
    ),
    cell: ({ getValue }) => formatDate(getValue()),
  }),
  columnHelper.display({
    id: 'expiration',
    header: 'Status',
    enableSorting: false,
    cell: ({ row }) => {
      const exp = row.original.expiration_date
      if (exp && new Date(exp) < new Date()) {
        return <Badge variant="destructive">Expired</Badge>
      }
      return null
    },
  }),
]

const PAGE_SIZE_OPTIONS = [25, 50, 100]

function PaginationBar({
  table,
  filteredCount,
}: {
  table: TanstackTable<Model>
  filteredCount: number
}) {
  const { pageIndex, pageSize } = table.getState().pagination
  return (
    <div className="flex items-center justify-between px-1 text-sm">
      <span className="text-muted-foreground">
        {filteredCount} model{filteredCount !== 1 ? 's' : ''} · page {pageIndex + 1} of{' '}
        {table.getPageCount()}
      </span>
      <div className="flex items-center gap-2">
        <Select
          value={String(pageSize)}
          onValueChange={(v) => table.setPageSize(Number(v ?? 25))}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        <button
          className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>
    </div>
  )
}

type Props = {
  models: Model[]
}

export function ModelsTable({ models }: Props) {
  const router = useRouter()
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  })

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [])

  const allProviders = useMemo(
    () => Array.from(new Set(models.map((m) => m.provider))).sort(),
    [models],
  )

  const filteredData = useMemo(() => {
    const q = filters.search.toLowerCase()
    return models.filter((model) => {
      if (filters.mainProvidersOnly && !isMainProvider(model.provider)) return false
      if (filters.provider !== 'all' && model.provider !== filters.provider) return false
      if (q && !model.name.toLowerCase().includes(q) && !model.openrouter_id.toLowerCase().includes(q)) return false
      if (filters.modality !== 'all') {
        const has =
          model.input_modalities.includes(filters.modality) ||
          model.output_modalities.includes(filters.modality)
        if (!has) return false
      }
      if (filters.tools && !model.supports_tools) return false
      if (filters.structuredOutputs && !model.supports_structured_outputs) return false
      if (filters.freePaid === 'free' && !model.is_free) return false
      if (filters.freePaid === 'paid' && model.is_free) return false
      return true
    })
  }, [models, filters])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-4">
      <TableFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        allProviders={allProviders}
      />

      {filteredData.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No models found.</p>
      ) : (
        <>
          <PaginationBar table={table} filteredCount={filteredData.length} />

          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          className="flex items-center gap-1 hover:text-foreground"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUpIcon className="size-3" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDownIcon className="size-3" />
                          ) : (
                            <ChevronsUpDownIcon className="size-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/models/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <PaginationBar table={table} filteredCount={filteredData.length} />
        </>
      )}
    </div>
  )
}

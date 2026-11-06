import React from 'react'
import { format, parseISO } from 'date-fns'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Amount, toDecimal } from '@/types/common/amount'
import {
  PricingComparisonColumn,
  PricingComparisonReport,
  PricingComparisonSlice,
  PricingComparisonValue,
} from '@/types/report'

const usdFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const deviationFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})

function formatUsd(amount: Amount): string {
  return usdFormat.format(toDecimal(amount))
}

function formatDeviation(deviation: number): string {
  return `${deviationFormat.format(deviation)}%`
}

function formatDate(date: string): string {
  return format(parseISO(date), 'dd.MM.yyyy')
}

export function formatSliceGeography(slice: PricingComparisonSlice): string {
  return [slice.country, slice.city, slice.store].filter(Boolean).join(' / ') || 'All locations'
}

export function formatSlicePeriod(slice: PricingComparisonSlice): string {
  const { from, to } = slice.date
  return from === to ? formatDate(from) : `${formatDate(from)} – ${formatDate(to)}`
}

interface PricingComparisonTableProps {
  report: PricingComparisonReport
}

export function PricingComparisonTable({ report }: PricingComparisonTableProps) {
  const { columns, categories } = report

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th className="sticky left-0 z-10 bg-background px-3 py-2 text-left align-bottom font-medium">
              Category
            </th>
            {columns.map((column, index) => (
              <th key={index} className="min-w-44 px-3 py-2 text-right align-bottom font-medium">
                <SliceHeader column={column} base={index === 0} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.category} className="border-b">
              <td className="sticky left-0 z-10 bg-background px-3 py-2 whitespace-nowrap">
                {category.category}
              </td>
              {category.values.map((value, index) => (
                <td key={index} className="px-3 py-2 text-right whitespace-nowrap">
                  <ValueCell value={value} base={index === 0} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-semibold">
            <td className="sticky left-0 z-10 bg-background px-3 py-2">Total</td>
            {columns.map((column, index) => (
              <td key={index} className="px-3 py-2 text-right whitespace-nowrap">
                <ValueCell value={column.total} base={index === 0} />
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function SliceHeader({ column, base }: { column: PricingComparisonColumn; base: boolean }) {
  return (
    <div className="flex flex-col items-end gap-1">
      {base && <Badge variant="secondary">Base</Badge>}
      <span className="whitespace-nowrap">{formatSliceGeography(column.slice)}</span>
      <span className="whitespace-nowrap text-xs font-normal text-muted-foreground">
        {formatSlicePeriod(column.slice)}
      </span>
      {column.empty && (
        <span className="text-xs font-normal text-muted-foreground">No data</span>
      )}
    </div>
  )
}

function ValueCell({ value, base }: { value: PricingComparisonValue; base: boolean }) {
  if (!value.amount) {
    return <span className="text-muted-foreground">—</span>
  }

  const deviation = base ? undefined : value.deviation

  return (
    <span className="font-mono tabular-nums">
      {formatUsd(value.amount)}
      {deviation !== undefined && (
        <>
          <span className="text-muted-foreground"> · </span>
          <span
            className={cn(
              deviation > 0 && 'text-destructive',
              deviation < 0 && 'text-green-600 dark:text-green-400',
              deviation === 0 && 'text-muted-foreground',
            )}
          >
            {formatDeviation(deviation)}
          </span>
        </>
      )}
    </span>
  )
}

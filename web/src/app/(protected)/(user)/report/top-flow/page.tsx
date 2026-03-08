'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { useTopFlowReportStore } from '@/store/report'
import { Layout } from '@/components/common/layout/layout'
import { Typography } from '@/components/common/typography/typography'
import { Filter } from '@/components/common/filter/filter'
import { MonthFilter } from '@/components/common/filter/month-filter'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { toDecimal } from '@/types/common/amount'
import { TopFlowGroup } from '@/types/report'
import { MonthRange } from '@/components/common/input/month-input'

function getDefaultDates() {
  const now = new Date()
  const to = new Date(now.getFullYear(), now.getMonth(), 1)
  const from = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  return { from, to }
}

function toMonthStart(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
}

function toMonthEnd(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]
}

function formatMonth(dateStr: string): string {
  return format(parseISO(dateStr), 'MMMM yyyy')
}

function getMaxAmount(group: TopFlowGroup): number {
  return group.entries
    .filter((e) => !e.other)
    .reduce((max, e) => Math.max(max, Math.abs(toDecimal(e.amount))), 0)
}

export default function TopFlowPage() {
  const { data, loading, fetch, setBody } = useTopFlowReportStore()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const defaults = getDefaultDates()
  const [filterValue, setFilterValue] = useState<Record<string, unknown>>({
    period: { from: defaults.from, to: defaults.to } satisfies MonthRange,
  })

  const applyFilter = useCallback(
    (value: Record<string, unknown>) => {
      const period = value.period as MonthRange | undefined
      const from = period?.from
      const to = period?.to
      if (!from || !to) return
      setBody({ date: { from: toMonthStart(from), to: toMonthEnd(to) } })
      void fetch()
    },
    [setBody, fetch],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { applyFilter(filterValue) }, [])

  const handleFilterChange = useCallback(
    (value: Record<string, unknown>) => {
      setFilterValue(value)
      applyFilter(value)
    },
    [applyFilter],
  )

  const toggleExpanded = useCallback((date: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(date)) {
        next.delete(date)
      } else {
        next.add(date)
      }
      return next
    })
  }, [])

  const groups = data?.groups ?? []

  return (
    <Layout scrollable>
      <div className="shrink-0 flex items-center justify-between">
        <Typography variant="h3">Top Flow</Typography>
      </div>

      <div className="shrink-0">
        <Filter value={filterValue} onChange={handleFilterChange}>
          <MonthFilter id="period" label="Period" mode="range" />
        </Filter>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2">
          <Spinner className="size-4" />
          <Typography variant="muted">Loading...</Typography>
        </div>
      ) : groups.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Typography variant="muted">No data for selected period</Typography>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((group) => {
            const isExpanded = expanded.has(group.date)
            const maxAmount = getMaxAmount(group)

            return (
              <div key={group.date} className="rounded-lg border overflow-hidden">
                {/* Month header */}
                <div className="grid grid-cols-2 px-4 py-2.5 bg-muted/50 border-b">
                  <Typography variant="small" className="font-semibold">
                    {formatMonth(group.date)}
                  </Typography>
                  <div className="text-right">
                    <AmountLabel amount={group.amount} variant="expense" />
                  </div>
                </div>

                {/* Entries */}
                {group.entries.map((entry, i) => {
                  const isOther = entry.other
                  const hasOtherEntries = isOther && group.otherEntries.length > 0
                  const barWidth =
                    !isOther && maxAmount > 0
                      ? (Math.abs(toDecimal(entry.amount)) / maxAmount) * 100
                      : 0

                  return (
                    <React.Fragment key={isOther ? '__other__' : entry.account?.id ?? i}>
                      <div
                        className={cn(
                          'relative px-4 py-2.5 flex items-center justify-between transition-colors hover:bg-muted/30',
                          i > 0 && 'border-t',
                          hasOtherEntries && 'cursor-pointer select-none',
                        )}
                        onClick={hasOtherEntries ? () => toggleExpanded(group.date) : undefined}
                      >
                        {/* Proportional bar */}
                        {!isOther && (
                          <div
                            className="absolute inset-y-0 left-0 bg-destructive/10 pointer-events-none transition-all"
                            style={{ width: `${barWidth}%` }}
                          />
                        )}

                        <Typography
                          variant="small"
                          className={cn('relative', isOther && 'text-muted-foreground italic')}
                        >
                          {isOther
                            ? `Other (${group.otherEntries.length})`
                            : (entry.account?.name ?? '—')}
                        </Typography>

                        <div className="relative flex items-center gap-2">
                          <AmountLabel amount={entry.amount} variant="expense" />
                          {hasOtherEntries && (
                            isExpanded
                              ? <ChevronUp className="size-3.5 text-muted-foreground" />
                              : <ChevronDown className="size-3.5 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Expanded "other" breakdown */}
                      {isOther && isExpanded &&
                        group.otherEntries.map((other, j) => (
                          <div
                            key={other.account?.id ?? j}
                            className="border-t pl-8 pr-4 py-2 flex items-center justify-between bg-muted/20"
                          >
                            <Typography variant="small" className="text-muted-foreground">
                              {other.account?.name ?? '—'}
                            </Typography>
                            <AmountLabel amount={other.amount} variant="expense" />
                          </div>
                        ))}
                    </React.Fragment>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}

'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'

import { useIncomeExpenseReportStore } from '@/store/report'
import { Layout } from '@/components/common/layout/layout'
import { Typography } from '@/components/common/typography/typography'
import { Filter } from '@/components/common/filter/filter'
import { MonthFilter } from '@/components/common/filter/month-filter'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { Amount, emptyAmount, subtract } from '@/types/common/amount'
import { IncomeExpenseGroup } from '@/types/report'
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

function getEntry(group: IncomeExpenseGroup, type: 'INCOME' | 'EXPENSE'): Amount | undefined {
  return group.entries.find((e) => e.type === type)?.amount
}

function getBalance(group: IncomeExpenseGroup): Amount | undefined {
  const income = getEntry(group, 'INCOME')
  const expense = getEntry(group, 'EXPENSE')
  if (!income && !expense) return undefined
  const currency = income?.currency ?? expense!.currency
  return subtract(income ?? emptyAmount(currency), expense ?? emptyAmount(currency))
}


export default function IncomeExpensePage() {
  const { data, loading, fetch, setBody } = useIncomeExpenseReportStore()

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

  const groups = data?.groups ?? []

  return (
    <Layout scrollable>
      <div className="shrink-0 flex items-center justify-between">
        <Typography variant="h3">Income &amp; Expense</Typography>
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
        <div className="rounded-lg border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 px-4 py-2.5 bg-muted/50 border-b">
            <Typography variant="muted" className="text-xs uppercase tracking-wider font-semibold">
              Month
            </Typography>
            <Typography variant="muted" className="text-xs uppercase tracking-wider font-semibold text-right text-green-600 dark:text-green-400">
              Income
            </Typography>
            <Typography variant="muted" className="text-xs uppercase tracking-wider font-semibold text-right text-destructive">
              Expense
            </Typography>
            <Typography variant="muted" className="text-xs uppercase tracking-wider font-semibold text-right">
              Balance
            </Typography>
          </div>

          {/* Rows */}
          {groups.map((group, i) => {
            const income = getEntry(group, 'INCOME')
            const expense = getEntry(group, 'EXPENSE')
            const balance = getBalance(group)
            return (
              <div
                key={group.date}
                className={cn(
                  'grid grid-cols-4 px-4 py-3 items-center text-sm transition-colors hover:bg-muted/30',
                  i > 0 && 'border-t',
                )}
              >
                <Typography variant="small">{formatMonth(group.date)}</Typography>
                <div className="text-right">
                  <AmountLabel amount={income} variant="income" />
                </div>
                <div className="text-right">
                  <AmountLabel amount={expense} variant="expense" />
                </div>
                <div className="text-right">
                  <AmountLabel amount={balance} variant="balance" />
                </div>
              </div>
            )
          })}

        </div>
      )}
    </Layout>
  )
}

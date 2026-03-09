'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'

import { useIncomeExpenseReportStore } from '@/store/report'
import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { Group } from '@/components/common/layout/group'
import { Typography } from '@/components/common/typography/typography'
import { Filter } from '@/components/common/filter/filter'
import { MonthFilter } from '@/components/common/filter/month-filter'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Spinner } from '@/components/ui/spinner'
import { Amount, emptyAmount, subtract, toDecimal } from '@/types/common/amount'
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

  const globalMax = Math.max(
    ...groups.flatMap((g) => [
      getEntry(g, 'INCOME') ? Math.abs(toDecimal(getEntry(g, 'INCOME')!)) : 0,
      getEntry(g, 'EXPENSE') ? Math.abs(toDecimal(getEntry(g, 'EXPENSE')!)) : 0,
    ]),
    0,
  )

  return (
    <Layout scrollable>
      <Stack orientation="horizontal" align="center" justify="between" className="shrink-0">
        <Typography variant="h3">Income &amp; Expense</Typography>
      </Stack>

      <div className="shrink-0">
        <Filter value={filterValue} onChange={handleFilterChange}>
          <MonthFilter id="period" label="Period" mode="range" />
        </Filter>
      </div>

      {loading ? (
        <Stack orientation="horizontal" align="center" justify="center" gap={2} className="py-16">
          <Spinner className="size-4" />
          <Typography variant="muted">Loading...</Typography>
        </Stack>
      ) : groups.length === 0 ? (
        <Stack align="center" justify="center" className="py-16">
          <Typography variant="muted">No data for selected period</Typography>
        </Stack>
      ) : (
        <Stack gap={4}>
          {groups.map((group) => {
            const income = getEntry(group, 'INCOME')
            const expense = getEntry(group, 'EXPENSE')
            const balance = getBalance(group)
            const incomeBar = income && globalMax > 0 ? (Math.abs(toDecimal(income)) / globalMax) * 100 : 0
            const expenseBar = expense && globalMax > 0 ? (Math.abs(toDecimal(expense)) / globalMax) * 100 : 0

            return (
              <Group key={group.date} title={formatMonth(group.date)}>
                {/* Income row */}
                <div className="relative py-2">
                  <div
                    className="absolute inset-y-0 left-0 bg-green-500/10 pointer-events-none transition-all"
                    style={{ width: `${incomeBar}%` }}
                  />
                  <Stack orientation="horizontal" align="center" justify="between" gap={2} className="relative">
                    <Typography variant="small" className="text-green-600 dark:text-green-400">
                      Income
                    </Typography>
                    <AmountLabel amount={income} variant="income" />
                  </Stack>
                </div>

                {/* Expense row */}
                <div className="relative py-2">
                  <div
                    className="absolute inset-y-0 left-0 bg-destructive/10 pointer-events-none transition-all"
                    style={{ width: `${expenseBar}%` }}
                  />
                  <Stack orientation="horizontal" align="center" justify="between" gap={2} className="relative">
                    <Typography variant="small" className="text-destructive">
                      Expense
                    </Typography>
                    <AmountLabel amount={expense} variant="expense" />
                  </Stack>
                </div>

                {/* Balance row */}
                <Stack
                  orientation="horizontal"
                  align="center"
                  justify="between"
                  gap={2}
                  className="py-2 border-t"
                >
                  <Typography variant="muted">Balance</Typography>
                  <AmountLabel amount={balance} variant="balance" />
                </Stack>
              </Group>
            )
          })}
        </Stack>
      )}
    </Layout>
  )
}

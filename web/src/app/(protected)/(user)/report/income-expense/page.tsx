'use client'

import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { endOfMonth, format, parseISO } from 'date-fns'

import { useIncomeExpenseReportStore } from '@/store/report'
import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { Group } from '@/components/common/layout/group'
import { Typography } from '@/components/common/typography/typography'
import { Filter } from '@/components/common/filter/filter'
import { MonthFilter } from '@/components/common/filter/month-filter'
import { AccountFilter } from '@/components/common/filter/account-filter'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Spinner } from '@/components/ui/spinner'
import { formatMonth, getDefaultMonthRange } from '@/lib/utils'
import { Amount, toDecimal } from '@/types/common/amount'
import { IncomeExpenseGroup } from '@/types/report'
import { MonthRange } from '@/components/common/input/month-input'
import { AccountType } from '@/types/account'
import { OperationType } from '@/types/operation'
import { TagFilter } from '@/components/common/filter/tag-filter'
import {
  paramToDate,
  paramToIds,
  setDateParam,
  setIdsParam,
  useFilterUrlSync,
} from '@/lib/filter-url'
import { buildOperationDrilldownUrl } from '@/lib/operation-drilldown'

const PRESET_KEY = 'REPORT_INCOME_EXPENSE'

function getEntry(
  group: IncomeExpenseGroup,
  type: AccountType.INCOME | AccountType.EXPENSE,
): Amount | undefined {
  return group.entries.find((e) => e.type === type)?.amount
}

function toUrlParams(filterValue: Record<string, unknown>): URLSearchParams {
  const period = filterValue.period as MonthRange | undefined
  const params = new URLSearchParams()

  setDateParam(params, 'dateFrom', period?.from)
  setDateParam(params, 'dateTo', period?.to)
  setIdsParam(params, 'include', filterValue.include)
  setIdsParam(params, 'exclude', filterValue.exclude)
  setIdsParam(params, 'includeTags', filterValue.includeTags)
  setIdsParam(params, 'excludeTags', filterValue.excludeTags)

  return params
}

function fromUrlParams(params: URLSearchParams): Record<string, unknown> {
  const value: Record<string, unknown> = {}

  const from = paramToDate(params.get('dateFrom'))
  const to = paramToDate(params.get('dateTo'))
  value.period = (from || to ? { from, to } : getDefaultMonthRange()) satisfies MonthRange

  const include = paramToIds(params.get('include'))
  if (include) value.include = include

  const exclude = paramToIds(params.get('exclude'))
  if (exclude) value.exclude = exclude

  const includeTags = paramToIds(params.get('includeTags'))
  if (includeTags) value.includeTags = includeTags

  const excludeTags = paramToIds(params.get('excludeTags'))
  if (excludeTags) value.excludeTags = excludeTags

  return value
}

export default function IncomeExpensePage() {
  return (
    <Suspense>
      <IncomeExpensePageContent />
    </Suspense>
  )
}

function IncomeExpensePageContent() {
  const { data, loading, fetch, setBody } = useIncomeExpenseReportStore()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [filterValue, setFilterValue] = useState<Record<string, unknown>>(() =>
    fromUrlParams(searchParams),
  )

  const applyFilter = useCallback(
    (value: Record<string, unknown>) => {
      const period = value.period as MonthRange | undefined
      const from = period?.from
      const to = period?.to
      if (!from || !to) return
      setBody({
        date: { from: format(from, 'yyyy-MM-dd'), to: format(to, 'yyyy-MM-dd') },
        include: value.include as string[] | undefined,
        exclude: value.exclude as string[] | undefined,
        includeTags: value.includeTags as string[] | undefined,
        excludeTags: value.excludeTags as string[] | undefined,
      })
      void fetch()
    },
    [setBody, fetch],
  )

  useFilterUrlSync(filterValue, toUrlParams)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    applyFilter(filterValue)
  }, [])

  const handleFilterChange = useCallback(
    (value: Record<string, unknown>) => {
      setFilterValue(value)
      applyFilter(value)
    },
    [applyFilter],
  )

  const drilldown = (group: IncomeExpenseGroup, type: OperationType) => {
    const monthStart = parseISO(group.date)
    const monthEnd = endOfMonth(monthStart)
    router.push(buildOperationDrilldownUrl({ dateFrom: monthStart, dateTo: monthEnd, type }))
  }

  const groups = data?.groups ?? []

  const globalMax = Math.max(
    ...groups.flatMap((g) => [
      getEntry(g, AccountType.INCOME) ? Math.abs(toDecimal(getEntry(g, AccountType.INCOME)!)) : 0,
      getEntry(g, AccountType.EXPENSE) ? Math.abs(toDecimal(getEntry(g, AccountType.EXPENSE)!)) : 0,
    ]),
    0,
  )

  return (
    <Layout scrollable>
      <Stack orientation="horizontal" align="center" justify="between" className="shrink-0">
        <Typography variant="h3">Income &amp; Expense</Typography>
      </Stack>

      <Filter value={filterValue} onChange={handleFilterChange} presetKey={PRESET_KEY}>
        <MonthFilter id="period" label="Period" mode="range" />
        <AccountFilter id="include" label="Include accounts" mode="multi" />
        <AccountFilter id="exclude" label="Exclude accounts" mode="multi" />
        <TagFilter id="includeTags" label="Include tags" mode="multi" />
        <TagFilter id="excludeTags" label="Exclude tags" mode="multi" />
      </Filter>

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
            const income = getEntry(group, AccountType.INCOME)
            const expense = getEntry(group, AccountType.EXPENSE)
            const incomeBar =
              income && globalMax > 0 ? (Math.abs(toDecimal(income)) / globalMax) * 100 : 0
            const expenseBar =
              expense && globalMax > 0 ? (Math.abs(toDecimal(expense)) / globalMax) * 100 : 0

            return (
              <Group
                key={group.date}
                title={formatMonth(group.date)}
                endContent={<AmountLabel amount={group.balance} />}
              >
                {/* Income row */}
                <Stack
                  orientation="horizontal"
                  align="center"
                  justify="between"
                  gap={2}
                  className="relative py-2 cursor-pointer select-none hover:bg-muted/30 transition-colors"
                  onClick={() => drilldown(group, OperationType.INCOME)}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-green-500/10 pointer-events-none transition-all"
                    style={{ width: `${incomeBar}%` }}
                  />
                  <Typography variant="small" className="text-green-600 dark:text-green-400">
                    Income
                  </Typography>
                  <AmountLabel amount={income} />
                </Stack>

                {/* Expense row */}
                <Stack
                  orientation="horizontal"
                  align="center"
                  justify="between"
                  gap={2}
                  className="relative py-2 cursor-pointer select-none hover:bg-muted/30 transition-colors"
                  onClick={() => drilldown(group, OperationType.EXPENSE)}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-destructive/10 pointer-events-none transition-all"
                    style={{ width: `${expenseBar}%` }}
                  />
                  <Typography variant="small" className="text-destructive">
                    Expense
                  </Typography>
                  <AmountLabel amount={expense} />
                </Stack>
              </Group>
            )
          })}
        </Stack>
      )}
    </Layout>
  )
}

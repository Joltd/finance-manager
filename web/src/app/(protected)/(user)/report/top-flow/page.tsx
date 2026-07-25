'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { endOfMonth, format, parseISO } from 'date-fns'

import { useTopFlowReportStore } from '@/store/report'
import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { Group } from '@/components/common/layout/group'
import { Typography } from '@/components/common/typography/typography'
import { Filter } from '@/components/common/filter/filter'
import { MonthFilter } from '@/components/common/filter/month-filter'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Spinner } from '@/components/ui/spinner'
import { cn, formatMonth, getDefaultMonthRange } from '@/lib/utils'
import { toDecimal } from '@/types/common/amount'
import { TopFlowGroup } from '@/types/report'
import { MonthRange } from '@/components/common/input/month-input'
import { AccountFilter } from '@/components/common/filter/account-filter'
import { TagFilter } from '@/components/common/filter/tag-filter'
import {
  paramToDate,
  paramToIds,
  setDateParam,
  setIdsParam,
  useFilterUrlSync,
} from '@/lib/filter-url'
import { buildOperationDrilldownUrl } from '@/lib/operation-drilldown'

const PRESET_KEY = 'REPORT_TOP_FLOW'

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

export default function TopFlowPage() {
  return (
    <Suspense>
      <TopFlowPageContent />
    </Suspense>
  )
}

function TopFlowPageContent() {
  const { data, loading, fetch, setBody } = useTopFlowReportStore()
  const searchParams = useSearchParams()

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

  const groups = data?.groups ?? []

  return (
    <Layout scrollable>
      <Stack orientation="horizontal" align="center" justify="between" className="shrink-0">
        <Typography variant="h3">Top Flow</Typography>
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
          {groups.map((group) => (
            <TopFlowGroupCard key={group.date} group={group} />
          ))}
        </Stack>
      )}
    </Layout>
  )
}

function EntryRow({
  label,
  amount,
  barWidth,
  onClick,
}: {
  label: string
  amount: TopFlowGroup['amount']
  barWidth: number
  onClick?: () => void
}) {
  return (
    <Stack
      orientation="horizontal"
      align="center"
      justify="between"
      gap={2}
      className={cn(
        'relative py-2',
        onClick && 'cursor-pointer select-none hover:bg-muted/30 transition-colors',
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          'absolute inset-y-0 pointer-events-none transition-all',
          toDecimal(amount) < 0 ? 'right-0 bg-green-500/10' : 'left-0 bg-destructive/10',
        )}
        style={{ width: `${barWidth}%` }}
      />
      <Typography variant="small">{label}</Typography>
      <AmountLabel amount={amount} />
    </Stack>
  )
}

function TopFlowGroupCard({ group }: { group: TopFlowGroup }) {
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()

  const maxAmount = group.entries.reduce(
    (max, e) => Math.max(max, Math.abs(toDecimal(e.amount))),
    0,
  )

  const barWidth = (amount: TopFlowGroup['amount']) =>
    maxAmount > 0 ? (Math.abs(toDecimal(amount)) / maxAmount) * 100 : 0

  const monthStart = parseISO(group.date)
  const monthEnd = endOfMonth(monthStart)

  const drilldown = (accountId: string | undefined) => {
    if (!accountId) return
    router.push(buildOperationDrilldownUrl({ dateFrom: monthStart, dateTo: monthEnd, accountId }))
  }

  return (
    <Group
      title={formatMonth(group.date)}
      endContent={<AmountLabel amount={group.amount} />}
    >
      {group.entries.map((entry) => {
        const isOther = entry.other

        if (!isOther) {
          return (
            <EntryRow
              key={entry.account?.id}
              label={entry.account?.name ?? '—'}
              amount={entry.amount}
              barWidth={barWidth(entry.amount)}
              onClick={() => drilldown(entry.account?.id)}
            />
          )
        }

        if (!expanded) {
          return (
            <EntryRow
              key="__other__"
              label={`Other (${group.otherEntries.length})`}
              amount={entry.amount}
              barWidth={barWidth(entry.amount)}
              onClick={() => setExpanded(true)}
            />
          )
        }

        return (
          <Stack key="__other__" gap={2}>
            {group.otherEntries.map((other, j) => (
              <EntryRow
                key={other.account?.id ?? j}
                label={other.account?.name ?? '—'}
                amount={other.amount}
                barWidth={barWidth(other.amount)}
                onClick={() => drilldown(other.account?.id)}
              />
            ))}
          </Stack>
        )
      })}
    </Group>
  )
}

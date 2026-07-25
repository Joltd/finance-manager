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
  readDateRangeParam,
  readIdsParam,
  useFilterUrlSync,
  writeDateRangeParam,
  writeIdsParam,
} from '@/lib/filter-url'
import { buildOperationDrilldownUrl } from '@/lib/operation-drilldown'

const PRESET_KEY = 'REPORT_TOP_FLOW'

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

  const [filterValue, setFilterValue] = useState<Record<string, unknown>>(() => ({
    period: getDefaultMonthRange(),
    ...readDateRangeParam(searchParams, 'period'),
    ...readIdsParam(searchParams, 'include'),
    ...readIdsParam(searchParams, 'exclude'),
    ...readIdsParam(searchParams, 'includeTags'),
    ...readIdsParam(searchParams, 'excludeTags'),
  }))

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

  useFilterUrlSync(filterValue, (values, params) => {
    writeDateRangeParam(values, params, 'period')
    writeIdsParam(values, params, 'include')
    writeIdsParam(values, params, 'exclude')
    writeIdsParam(values, params, 'includeTags')
    writeIdsParam(values, params, 'excludeTags')
  })

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
            <TopFlowGroupCard
              key={group.date}
              group={group}
              includeTags={filterValue.includeTags as string[] | undefined}
              excludeTags={filterValue.excludeTags as string[] | undefined}
            />
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

function TopFlowGroupCard({
  group,
  includeTags,
  excludeTags,
}: {
  group: TopFlowGroup
  includeTags?: string[]
  excludeTags?: string[]
}) {
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()

  const maxAmount = group.entries.reduce(
    (max, e) => Math.max(max, Math.abs(toDecimal(e.amount))),
    0,
  )

  const barWidth = (amount: TopFlowGroup['amount']) =>
    maxAmount > 0 ? (Math.abs(toDecimal(amount)) / maxAmount) * 100 : 0

  const date = parseISO(group.date)
  const period = {
    from: date,
    to: endOfMonth(date),
  }

  const drilldown = (accountId: string | undefined) => {
    if (!accountId) return
    router.push(
      buildOperationDrilldownUrl({
        period,
        include: [accountId],
        includeTags,
        excludeTags,
      }),
    )
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

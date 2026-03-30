'use client'

import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'

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
import { ReportPreset, TopFlowGroup } from '@/types/report'
import { MonthRange } from '@/components/common/input/month-input'
import { AccountFilter } from '@/components/common/filter/account-filter'
import { AccountReference } from '@/types/account'
import { useRequest } from '@/hooks/use-request'
import { reportUrls } from '@/api/report'

export default function TopFlowPage() {
  const { data, loading, fetch, setBody } = useTopFlowReportStore()
  const presetReq = useRequest<ReportPreset>(reportUrls.preset, { method: 'GET' })

  const [filterValue, setFilterValue] = useState<Record<string, unknown>>({
    period: getDefaultMonthRange() satisfies MonthRange,
  })

  const applyFilter = useCallback(
    (value: Record<string, unknown>) => {
      const period = value.period as MonthRange | undefined
      const from = period?.from
      const to = period?.to
      if (!from || !to) return
      const ids = (key: string) => (value[key] as AccountReference[] | undefined)?.map((a) => a.id)
      setBody({
        date: { from: format(from, 'yyyy-MM-dd'), to: format(to, 'yyyy-MM-dd') },
        include: ids('include'),
        exclude: ids('exclude'),
      })
      void fetch()
    },
    [setBody, fetch],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const initial: Record<string, unknown> = { period: getDefaultMonthRange() satisfies MonthRange }
    presetReq.submit().then((preset) => {
      if (preset.exclude.length > 0) {
        initial.exclude = preset.exclude
        setFilterValue(initial)
      }
      applyFilter(initial)
    }).catch(() => {
      applyFilter(initial)
    })
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

      <Filter value={filterValue} onChange={handleFilterChange}>
        <MonthFilter id="period" label="Period" mode="range" />
        <AccountFilter id="include" label="Include" mode="multi" />
        <AccountFilter id="exclude" label="Exclude" mode="multi" />
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
      <AmountLabel amount={amount} variant="balance" />
    </Stack>
  )
}

function TopFlowGroupCard({ group }: { group: TopFlowGroup }) {
  const [expanded, setExpanded] = useState(false)

  const maxAmount = group.entries.reduce(
    (max, e) => Math.max(max, Math.abs(toDecimal(e.amount))),
    0,
  )

  const barWidth = (amount: TopFlowGroup['amount']) =>
    maxAmount > 0 ? (Math.abs(toDecimal(amount)) / maxAmount) * 100 : 0

  return (
    <Group title={formatMonth(group.date)}>
      {group.entries.map((entry) => {
        const isOther = entry.other

        if (!isOther) {
          return (
            <EntryRow
              key={entry.account?.id}
              label={entry.account?.name ?? '—'}
              amount={entry.amount}
              barWidth={barWidth(entry.amount)}
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
          <Stack
            key="__other__"
            className="cursor-pointer select-none hover:bg-muted/30 transition-colors"
            gap={2}
            onClick={() => setExpanded(false)}
          >
            {group.otherEntries.map((other, j) => (
              <EntryRow
                key={other.account?.id ?? j}
                label={other.account?.name ?? '—'}
                amount={other.amount}
                barWidth={barWidth(other.amount)}
              />
            ))}
          </Stack>
        )
      })}

      <Stack orientation="horizontal" align="center" justify="between" gap={2} className="py-2">
        <Typography variant="muted">Total</Typography>
        <AmountLabel amount={group.amount} variant="expense" />
      </Stack>
    </Group>
  )
}

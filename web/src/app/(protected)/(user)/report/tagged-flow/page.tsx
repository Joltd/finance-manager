'use client'

import { useCallback, useState } from 'react'

import { useTaggedFlowReportStore } from '@/store/report'
import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { Group } from '@/components/common/layout/group'
import { Typography } from '@/components/common/typography/typography'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Filter } from '@/components/common/filter/filter'
import { TagFilter } from '@/components/common/filter/tag-filter'
import { Spinner } from '@/components/ui/spinner'
import { Tag } from '@/types/tag'
import { toDecimal } from '@/types/common/amount'

export default function TaggedFlowPage() {
  const { data, loading, fetch, setBody } = useTaggedFlowReportStore()
  const [filterValue, setFilterValue] = useState<Record<string, unknown>>({})

  const applyFilter = useCallback(
    (value: Record<string, unknown>) => {
      const tag = value.tag as Tag | undefined
      if (!tag?.id) return
      setBody({ tag: tag.id })
      void fetch()
    },
    [setBody, fetch],
  )

  const handleFilterChange = useCallback(
    (value: Record<string, unknown>) => {
      setFilterValue(value)
      applyFilter(value)
    },
    [applyFilter],
  )

  const tag = filterValue.tag as Tag | undefined
  const entries = data?.entries ?? []

  const maxAmount = entries.reduce((max, e) => Math.max(max, Math.abs(toDecimal(e.amount))), 0)

  return (
    <Layout scrollable>
      <Stack orientation="horizontal" align="center" justify="between" className="shrink-0">
        <Typography variant="h3">Tagged Flow</Typography>
      </Stack>

      <Filter value={filterValue} onChange={handleFilterChange}>
        <TagFilter id="tag" label="Tag" required />
      </Filter>

      {loading ? (
        <Stack orientation="horizontal" align="center" justify="center" gap={2} className="py-16">
          <Spinner className="size-4" />
          <Typography variant="muted">Loading...</Typography>
        </Stack>
      ) : !tag ? (
        <Stack align="center" justify="center" className="py-16">
          <Typography variant="muted">Select a tag to see the report</Typography>
        </Stack>
      ) : entries.length === 0 ? (
        <Stack align="center" justify="center" className="py-16">
          <Typography variant="muted">No data for selected tag</Typography>
        </Stack>
      ) : (
        <Group title={tag.name}>
          {entries.map((entry) => {
            const positive = toDecimal(entry.amount) > 0
            const barWidth =
              maxAmount > 0 ? (Math.abs(toDecimal(entry.amount)) / maxAmount) * 100 : 0
            return (
              <Stack
                key={entry.category.id}
                orientation="horizontal"
                align="center"
                justify="between"
                gap={2}
                className="relative py-2"
              >
                <div
                  className={`absolute inset-y-0 pointer-events-none transition-all ${positive ? 'right-0 bg-green-500/10' : 'left-0 bg-destructive/10'}`}
                  style={{ width: `${barWidth}%` }}
                />
                <Typography variant="small">{entry.category.name}</Typography>
                <AmountLabel amount={entry.amount} variant="balance" />
              </Stack>
            )
          })}
        </Group>
      )}
    </Layout>
  )
}

'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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
import { tagUrls } from '@/api/tag'
import { useReferenceCache } from '@/hooks/use-reference-cache'
import { toDecimal } from '@/types/common/amount'
import { setParam, useFilterUrlSync } from '@/lib/filter-url'
import { buildOperationDrilldownUrl } from '@/lib/operation-drilldown'

const PRESET_KEY = 'REPORT_TAGGED_FLOW'

function toUrlParams(filterValue: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams()
  setParam(params, 'tag', filterValue.tag as string | undefined)
  return params
}

function fromUrlParams(params: URLSearchParams): Record<string, unknown> {
  const value: Record<string, unknown> = {}
  const tag = params.get('tag')
  if (tag) value.tag = tag
  return value
}

export default function TaggedFlowPage() {
  return (
    <Suspense>
      <TaggedFlowPageContent />
    </Suspense>
  )
}

function TaggedFlowPageContent() {
  const { data, loading, fetch, setBody } = useTaggedFlowReportStore()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [filterValue, setFilterValue] = useState<Record<string, unknown>>(() =>
    fromUrlParams(searchParams),
  )

  const applyFilter = useCallback(
    (value: Record<string, unknown>) => {
      const tagId = value.tag as string | undefined
      if (!tagId) return
      setBody({ tag: tagId })
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

  const tagId = filterValue.tag as string | undefined
  const { resolved: resolvedTags } = useReferenceCache<Tag>(tagUrls.root, tagId ? [tagId] : [])
  const tag = tagId ? resolvedTags[tagId] : undefined
  const entries = data?.entries ?? []

  const maxAmount = entries.reduce((max, e) => Math.max(max, Math.abs(toDecimal(e.amount))), 0)

  const drilldown = (categoryId: string | undefined) => {
    if (!tagId || !categoryId) return
    router.push(buildOperationDrilldownUrl({ tagId, accountId: categoryId }))
  }

  return (
    <Layout scrollable>
      <Stack orientation="horizontal" align="center" justify="between" className="shrink-0">
        <Typography variant="h3">Tagged Flow</Typography>
      </Stack>

      <Filter value={filterValue} onChange={handleFilterChange} presetKey={PRESET_KEY}>
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
        <Group title={tag.name} endContent={<AmountLabel amount={data?.total} />}>
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
                className="relative py-2 cursor-pointer select-none hover:bg-muted/30 transition-colors"
                onClick={() => drilldown(entry.category.id)}
              >
                <div
                  className={`absolute inset-y-0 pointer-events-none transition-all ${positive ? 'right-0 bg-green-500/10' : 'left-0 bg-destructive/10'}`}
                  style={{ width: `${barWidth}%` }}
                />
                <Typography variant="small">{entry.category.name}</Typography>
                <AmountLabel amount={entry.amount} />
              </Stack>
            )
          })}
        </Group>
      )}
    </Layout>
  )
}

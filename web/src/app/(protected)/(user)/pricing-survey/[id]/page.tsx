'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeftIcon, CheckIcon, ChevronRightIcon, ZapIcon } from 'lucide-react'

import { usePricingSurveyProgressStore } from '@/store/pricing-survey'
import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { Typography } from '@/components/common/typography/typography'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { PricingItem } from '@/types/pricing-item'
import { PricingSurveyCategoryProgress, PricingSurveyItemProgress } from '@/types/pricing-survey'
import { QuickAdd } from '@/app/(protected)/(user)/pricing-order/new/quick-add'
import { SurveyProgress, formatSurveyPeriod } from '../survey-progress'

// An open Quick Add replaces the page content; `item` is set when it was opened for a specific item
interface QuickAddState {
  item?: PricingItem
}

export default function PricingSurveyProgressPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const store = usePricingSurveyProgressStore()
  const [quickAdd, setQuickAdd] = useState<QuickAddState>()
  const [expanded, setExpanded] = useState<string[]>([])

  useEffect(() => {
    store.setPathParams({ id })
    void store.fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // The store is shared between surveys, so ignore the data left from a previously opened one
  const progress = store.data?.survey.id === id ? store.data : undefined

  const handleBack = () => {
    router.push('/pricing-survey')
  }

  const handleToggle = (category: string) => {
    setExpanded((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]))
  }

  const handleOrderSaved = () => {
    void store.fetch()
    if (quickAdd?.item) {
      setQuickAdd(undefined)
    }
  }

  if (quickAdd && progress) {
    return (
      <Layout scrollable width="narrow">
        <QuickAdd
          survey={progress.survey}
          initialItem={quickAdd.item}
          exitLabel="Back to survey"
          onExit={() => setQuickAdd(undefined)}
          onSaved={handleOrderSaved}
        />
      </Layout>
    )
  }

  return (
    <Layout scrollable width="narrow">
      <Button type="button" variant="ghost" size="sm" className="self-start" onClick={handleBack}>
        <ArrowLeftIcon />
        Back to surveys
      </Button>

      {!progress ? (
        store.error ? (
          <Typography variant="muted">{store.error}</Typography>
        ) : (
          <LoadingSkeleton />
        )
      ) : (
        <>
          <Stack gap={4}>
            <Stack gap={1}>
              <Typography variant="h3" className="truncate">
                {progress.survey.country}, {progress.survey.city}
              </Typography>
              <Typography variant="muted">
                {progress.survey.currency} · {formatSurveyPeriod(progress)}
              </Typography>
            </Stack>

            <SurveyProgress filled={progress.filled} total={progress.total} />

            <Button type="button" variant="outline" size="lg" onClick={() => setQuickAdd({})}>
              <ZapIcon />
              Quick Add
            </Button>
          </Stack>

          {progress.categories.length === 0 ? (
            <Typography variant="muted">No pricing items yet. Use Quick Add to create the first one.</Typography>
          ) : (
            <Stack gap={0} className="divide-y">
              {progress.categories.map((category) => (
                <CategoryRow
                  key={category.category}
                  category={category}
                  expanded={expanded.includes(category.category)}
                  onToggle={handleToggle}
                  onSelect={(item) => setQuickAdd({ item })}
                />
              ))}
            </Stack>
          )}
        </>
      )}
    </Layout>
  )
}

interface CategoryRowProps {
  category: PricingSurveyCategoryProgress
  expanded: boolean
  onToggle: (category: string) => void
  onSelect: (item: PricingItem) => void
}

function CategoryRow({ category, expanded, onToggle, onSelect }: CategoryRowProps) {
  // Items still missing a price go first
  const items = [...category.items].sort((a, b) => Number(a.filled) - Number(b.filled))

  return (
    <Stack gap={0}>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => onToggle(category.category)}
        className="flex w-full flex-col gap-2 py-3 text-left"
      >
        <Stack orientation="horizontal" align="center" gap={2}>
          <ChevronRightIcon
            className={cn('size-4 shrink-0 text-muted-foreground transition-transform', expanded && 'rotate-90')}
          />
          <Typography as="span" variant="small" className="min-w-0 flex-1 truncate leading-snug">
            {category.category}
          </Typography>
        </Stack>
        <SurveyProgress filled={category.filled} total={category.total} className="pl-6" />
      </button>

      {expanded && (
        <Stack gap={0} className="pb-2 pl-3">
          {items.map((entry) => (
            <ItemRow key={entry.item.id} entry={entry} onSelect={onSelect} />
          ))}
        </Stack>
      )}
    </Stack>
  )
}

interface ItemRowProps {
  entry: PricingSurveyItemProgress
  onSelect: (item: PricingItem) => void
}

function ItemRow({ entry, onSelect }: ItemRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(entry.item)}
      className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-3 text-left hover:bg-accent hover:text-accent-foreground active:bg-accent"
    >
      <span className={cn('min-w-0 truncate font-medium', entry.filled && 'text-muted-foreground')}>
        {entry.item.name}
      </span>
      {entry.filled ? (
        <Stack orientation="horizontal" align="center" gap={2} className="shrink-0">
          <AmountLabel amount={entry.price} />
          <CheckIcon className="size-4 text-muted-foreground" />
        </Stack>
      ) : (
        <span className="shrink-0 text-sm text-muted-foreground">{entry.item.unit}</span>
      )}
    </button>
  )
}

function LoadingSkeleton() {
  return (
    <Stack gap={4}>
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-1 w-full" />
      {[1, 2, 3, 4].map((i) => (
        <Stack key={i} gap={2} className="py-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-1 w-full" />
        </Stack>
      ))}
    </Stack>
  )
}

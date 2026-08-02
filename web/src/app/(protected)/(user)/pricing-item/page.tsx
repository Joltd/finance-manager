'use client'

import { useEffect, useState } from 'react'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'

import { usePricingItemListStore } from '@/store/pricing-item'
import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { Pager } from '@/components/common/layout/pager'
import { Typography } from '@/components/common/typography/typography'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Filter } from '@/components/common/filter/filter'
import { TextFilter } from '@/components/common/filter/text-filter'
import { TextSuggestFilter } from '@/components/common/filter/text-suggest-filter'
import { useRequest } from '@/hooks/use-request'
import { pricingItemUrls } from '@/api/pricing-item'
import { PricingItem, PricingItemFilter } from '@/types/pricing-item'
import { PricingItemSheet, openPricingItemSheet } from './pricing-item-sheet'

const PAGE_SIZE = 20

function toQuery(filterValue: Record<string, unknown>, page: number): PricingItemFilter {
  return {
    name: filterValue.name as string | undefined,
    category: filterValue.category as string | undefined,
    unit: filterValue.unit as string | undefined,
    page,
    size: PAGE_SIZE,
  }
}

export default function PricingItemPage() {
  const store = usePricingItemListStore()
  const deletePricingItem = useRequest(pricingItemUrls.id, { method: 'DELETE' })
  const [filterValue, setFilterValue] = useState<Record<string, unknown>>({})
  const [page, setPage] = useState(0)

  useEffect(() => {
    store.setQueryParams(toQuery(filterValue, page))
    void store.fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue, page])

  const handleFilterChange = (value: Record<string, unknown>) => {
    setFilterValue(value)
    setPage(0)
  }

  const handleAdd = () => {
    openPricingItemSheet()
  }

  const handleEdit = (id: string) => {
    openPricingItemSheet(id)
  }

  const handleDelete = async (id: string) => {
    await deletePricingItem.submit({ pathParams: { id } })
    void store.fetch()
  }

  return (
    <Layout scrollable>
      <PricingItemSheet />

      <Stack orientation="horizontal" align="center" gap={2}>
        <Typography variant="h3" className="grow">
          Pricing Items
        </Typography>
        <Button size="sm" onClick={handleAdd}>
          <PlusIcon />
          Item
        </Button>
      </Stack>

      <Filter value={filterValue} onChange={handleFilterChange}>
        <TextFilter id="name" label="Name" />
        <TextSuggestFilter id="category" label="Category" url={pricingItemUrls.categoryReference} />
        <TextSuggestFilter id="unit" label="Unit" url={pricingItemUrls.unitReference} />
      </Filter>

      {store.loading && !store.data ? (
        <LoadingSkeleton />
      ) : (
        <Stack gap={0}>
          {store.data?.records.map((item) => (
            <PricingItemRow key={item.id} item={item} onEdit={handleEdit} onDelete={(id) => void handleDelete(id)} />
          ))}
        </Stack>
      )}

      <Pager
        page={page}
        size={PAGE_SIZE}
        total={store.data?.total ?? 0}
        onPageChange={setPage}
      />
    </Layout>
  )
}

interface PricingItemRowProps {
  item: PricingItem
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

function PricingItemRow({ item, onEdit, onDelete }: PricingItemRowProps) {
  return (
    <Stack orientation="horizontal" align="center" justify="between" gap={2} className="group py-2.5">
      <Typography as="span" variant="small" className="min-w-0 truncate">
        {item.name}
      </Typography>

      <Stack orientation="horizontal" gap={0}>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 w-5 h-5 group-hover:opacity-100 transition-opacity"
          onClick={() => onEdit(item.id!)}
        >
          <PencilIcon className="w-3! h-3!" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 w-5 h-5 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
          onClick={() => onDelete(item.id!)}
        >
          <Trash2Icon className="w-3! h-3!" />
        </Button>
      </Stack>

      <div className="grow" />

      <Typography as="span" variant="muted" className="shrink-0">
        {item.category}
      </Typography>
      <Typography as="span" variant="muted" className="shrink-0">
        {item.unit}
      </Typography>
    </Stack>
  )
}

function LoadingSkeleton() {
  return (
    <Stack gap={0}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Stack key={i} orientation="horizontal" align="center" gap={1} className="py-2.5">
          <Skeleton className="h-4 w-40 grow" />
          <Skeleton className="h-4 w-16" />
        </Stack>
      ))}
    </Stack>
  )
}

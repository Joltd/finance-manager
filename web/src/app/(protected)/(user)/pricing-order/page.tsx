'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { addMonths, format, startOfMonth } from 'date-fns'
import { PencilIcon, PlusIcon, Trash2Icon, ZapIcon } from 'lucide-react'

import { usePricingOrderListStore } from '@/store/pricing-order'
import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { Pager } from '@/components/common/layout/pager'
import { Typography } from '@/components/common/typography/typography'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Filter } from '@/components/common/filter/filter'
import { MonthFilter } from '@/components/common/filter/month-filter'
import { PricingItemFilter } from '@/components/common/filter/pricing-item-filter'
import { TextSuggestFilter } from '@/components/common/filter/text-suggest-filter'
import { useRequest } from '@/hooks/use-request'
import { pricingOrderUrls } from '@/api/pricing-order'
import { PricingOrder, PricingOrderFilter } from '@/types/pricing-order'
import { PricingOrderSheet, openPricingOrderSheet } from './pricing-order-sheet'

const PAGE_SIZE = 20

function toQuery(filterValue: Record<string, unknown>, page: number): PricingOrderFilter {
  const month = filterValue.date as Date | undefined
  const from = month ? startOfMonth(month) : undefined
  const to = month ? startOfMonth(addMonths(month, 1)) : undefined

  return {
    'date.from': from ? format(from, 'yyyy-MM-dd') : undefined,
    'date.to': to ? format(to, 'yyyy-MM-dd') : undefined,
    item: filterValue.item as string | undefined,
    country: filterValue.country as string | undefined,
    city: filterValue.city as string | undefined,
    store: filterValue.store as string | undefined,
    page,
    size: PAGE_SIZE,
  }
}

export default function PricingOrderPage() {
  const router = useRouter()
  const store = usePricingOrderListStore()
  const deletePricingOrder = useRequest(pricingOrderUrls.id, { method: 'DELETE' })
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
    openPricingOrderSheet()
  }

  const handleQuickAdd = () => {
    router.push('/pricing-order/new')
  }

  const handleEdit = (id: string) => {
    openPricingOrderSheet(id)
  }

  const handleDelete = async (id: string) => {
    await deletePricingOrder.submit({ pathParams: { id } })
    void store.fetch()
  }

  return (
    <Layout scrollable>
      <PricingOrderSheet />

      <Stack orientation="horizontal" align="center" gap={2}>
        <Typography variant="h3" className="grow">
          Pricing Orders
        </Typography>
        <Button size="sm" variant="outline" onClick={handleQuickAdd}>
          <ZapIcon />
          Quick Add
        </Button>
        <Button size="sm" onClick={handleAdd}>
          <PlusIcon />
          Order
        </Button>
      </Stack>

      <Filter value={filterValue} onChange={handleFilterChange}>
        <MonthFilter id="date" label="Month" />
        <PricingItemFilter id="item" label="Item" />
        <TextSuggestFilter id="country" label="Country" url={pricingOrderUrls.countryReference} />
        <TextSuggestFilter id="city" label="City" url={pricingOrderUrls.cityReference} />
        <TextSuggestFilter id="store" label="Store" url={pricingOrderUrls.storeReference} />
      </Filter>

      {store.loading && !store.data ? (
        <LoadingSkeleton />
      ) : (
        <Stack gap={0}>
          {store.data?.records.map((order) => (
            <PricingOrderRow
              key={order.id}
              order={order}
              onEdit={handleEdit}
              onDelete={(id) => void handleDelete(id)}
            />
          ))}
        </Stack>
      )}

      <Pager page={page} size={PAGE_SIZE} total={store.data?.total ?? 0} onPageChange={setPage} />
    </Layout>
  )
}

interface PricingOrderRowProps {
  order: PricingOrder
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

function PricingOrderRow({ order, onEdit, onDelete }: PricingOrderRowProps) {
  return (
    <Stack orientation="horizontal" align="center" justify="between" gap={2} className="group py-2.5">
      <Typography as="span" variant="muted" className="shrink-0 w-24">
        {order.date}
      </Typography>

      <Typography as="span" variant="small" className="min-w-0 flex-1 truncate">
        {order.item.name}
      </Typography>

      <Stack orientation="horizontal" gap={0}>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 w-5 h-5 group-hover:opacity-100 transition-opacity"
          onClick={() => onEdit(order.id!)}
        >
          <PencilIcon className="w-3! h-3!" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 w-5 h-5 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
          onClick={() => onDelete(order.id!)}
        >
          <Trash2Icon className="w-3! h-3!" />
        </Button>
      </Stack>

      <Typography as="span" variant="muted" className="shrink-0">
        {[order.country, order.city, order.store].filter(Boolean).join(' / ')}
      </Typography>

      <Stack orientation="horizontal" align="center" justify="end" gap={1} className="shrink-0">
        <AmountLabel amount={order.priceUsd} />
        <AmountLabel amount={order.price} />
      </Stack>
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

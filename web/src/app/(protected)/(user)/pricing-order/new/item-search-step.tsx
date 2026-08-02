'use client'

import { useState } from 'react'
import { PlusIcon, SearchIcon } from 'lucide-react'

import { pricingItemUrls } from '@/api/pricing-item'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Stack } from '@/components/common/layout/stack'
import { Typography } from '@/components/common/typography/typography'
import { useDebounce } from '@/hooks/use-debounce'
import { useRequest } from '@/hooks/use-request'
import { PricingItem } from '@/types/pricing-item'

interface ItemSearchStepProps {
  onSelect: (item: PricingItem) => void
  onNew: (query: string) => void
}

export function ItemSearchStep({ onSelect, onNew }: ItemSearchStepProps) {
  const [query, setQuery] = useState('')
  const searchReq = useRequest<PricingItem[], unknown, { query: string }>(pricingItemUrls.top, { method: 'GET' })

  const debouncedSearch = useDebounce((val: string) => {
    if (!val) {
      searchReq.reset()
      return
    }
    void searchReq.submit({ queryParams: { query: val } })
  }, 300)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    debouncedSearch(val)
  }

  return (
    <Stack gap={4}>
      <Stack gap={1}>
        <Typography variant="h3">Find item</Typography>
        <Typography variant="muted">Search for an existing pricing item, or create a new one.</Typography>
      </Stack>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={handleChange}
          placeholder="Item name..."
          autoFocus
          className="pl-9 h-11 text-base"
        />
      </div>

      <Stack gap={0}>
        {searchReq.loading && (
          <Typography variant="muted" className="py-2">
            Searching...
          </Typography>
        )}
        {!searchReq.loading &&
          query &&
          searchReq.data?.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="flex w-full items-center justify-between rounded-md px-3 py-3 text-left hover:bg-accent hover:text-accent-foreground active:bg-accent"
            >
              <span className="truncate font-medium">{item.name}</span>
              <span className="shrink-0 text-sm text-muted-foreground">
                {[item.category, item.unit].filter(Boolean).join(' / ')}
              </span>
            </button>
          ))}
        {!searchReq.loading && query && (searchReq.data?.length ?? 0) === 0 && (
          <Typography variant="muted" className="py-2">
            No matching items
          </Typography>
        )}
      </Stack>

      <Button type="button" variant="outline" size="lg" onClick={() => onNew(query)}>
        <PlusIcon />
        New Item
      </Button>
    </Stack>
  )
}

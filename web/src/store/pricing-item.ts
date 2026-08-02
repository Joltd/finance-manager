import { createFetchStore } from '@/store/common/fetch'
import { pricingItemUrls } from '@/api/pricing-item'
import { PricingItem, PricingItemFilter } from '@/types/pricing-item'
import { PageResponse } from '@/types/common/common'

export const usePricingItemListStore = createFetchStore<PageResponse<PricingItem>, unknown, PricingItemFilter>(
  pricingItemUrls.root,
)

export const usePricingItemStore = createFetchStore<PricingItem, unknown, unknown, { id: string }>(
  pricingItemUrls.id,
)

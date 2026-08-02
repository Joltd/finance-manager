import { createFetchStore } from '@/store/common/fetch'
import { pricingOrderUrls } from '@/api/pricing-order'
import { PricingOrder, PricingOrderFilter } from '@/types/pricing-order'
import { PageResponse } from '@/types/common/common'

export const usePricingOrderListStore = createFetchStore<PageResponse<PricingOrder>, unknown, PricingOrderFilter>(
  pricingOrderUrls.root,
)

export const usePricingOrderStore = createFetchStore<PricingOrder, unknown, unknown, { id: string }>(
  pricingOrderUrls.id,
)

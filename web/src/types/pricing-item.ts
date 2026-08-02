import { Reference } from '@/types/common/reference'

export type PricingItemReference = Reference

export interface PricingItem {
  id?: string
  name: string
  category: string
  unit: string
  defaultQuantity: number
}

export interface PricingItemFilter {
  name?: string
  category?: string
  unit?: string
  page?: number
  size?: number
}

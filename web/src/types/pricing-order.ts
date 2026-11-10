import { Amount } from '@/types/common/amount'
import { PricingItem } from '@/types/pricing-item'
import { PricingSurvey } from '@/types/pricing-survey'

export interface PricingOrder {
  id?: string
  date: string
  item: PricingItem
  price: Amount
  quantity: number
  rate?: number
  priceUsd: Amount
  country: string
  city: string
  store: string
  comment?: string
  survey?: PricingSurvey
}

export interface PricingOrderFilter {
  'date.from'?: string
  'date.to'?: string
  item?: string
  country?: string
  city?: string
  store?: string
  page?: number
  size?: number
}

export interface PricingOrderDefaults {
  date: string
  currency?: string
  country: string
  city: string
  store: string
  comment?: string
}

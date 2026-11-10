import { Amount } from '@/types/common/amount'
import { PricingItem } from '@/types/pricing-item'

export interface PricingSurvey {
  id?: string
  country: string
  city: string
  currency: string
}

export interface PricingSurveySummary {
  survey: PricingSurvey
  dateFrom?: string
  dateTo?: string
  filled: number
  total: number
}

export interface PricingSurveyItemProgress {
  item: PricingItem
  filled: boolean
  price?: Amount
}

export interface PricingSurveyCategoryProgress {
  category: string
  filled: number
  total: number
  items: PricingSurveyItemProgress[]
}

export interface PricingSurveyProgress extends PricingSurveySummary {
  categories: PricingSurveyCategoryProgress[]
}

import { createFetchStore } from '@/store/common/fetch'
import { pricingSurveyUrls } from '@/api/pricing-survey'
import { PricingSurvey, PricingSurveyProgress, PricingSurveySummary } from '@/types/pricing-survey'

export const usePricingSurveyListStore = createFetchStore<PricingSurveySummary[]>(pricingSurveyUrls.root)

export const usePricingSurveyStore = createFetchStore<PricingSurvey, unknown, unknown, { id: string }>(
  pricingSurveyUrls.id,
)

export const usePricingSurveyProgressStore = createFetchStore<PricingSurveyProgress, unknown, unknown, { id: string }>(
  pricingSurveyUrls.progress,
)

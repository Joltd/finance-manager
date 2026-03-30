import { createFetchStore } from '@/store/common/fetch'
import { reportUrls } from '@/api/report'
import {
  Dashboard,
  IncomeExpenseFilter,
  IncomeExpenseReport,
  TaggedFlowFilter,
  TaggedFlowReport,
  TopFlowFilter,
  TopFlowReport,
} from '@/types/report'

export const useDashboardStore = createFetchStore<Dashboard>(reportUrls.dashboard)

export const useTopFlowReportStore = createFetchStore<TopFlowReport, TopFlowFilter>(
  reportUrls.topFlow,
  'POST',
)

export const useTaggedFlowReportStore = createFetchStore<TaggedFlowReport, TaggedFlowFilter>(
  reportUrls.taggedFlow,
  'POST',
)

export const useIncomeExpenseReportStore = createFetchStore<
  IncomeExpenseReport,
  IncomeExpenseFilter
>(reportUrls.incomeExpense, 'POST')

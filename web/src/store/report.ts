import { createFetchStore, FetchStoreState } from '@/store/common/fetch'
import { useStoreSelect } from '@/hooks/use-store-select'
import { reportUrls } from '@/api/report'
import { Dashboard } from '@/types/dashboard'
import { IncomeExpenseReportData, TopFlowReportData } from '@/types/report'

const dashboardStore = createFetchStore<Dashboard>(reportUrls.dashboard)

export const useDashboardStore = <K extends keyof FetchStoreState<Dashboard>>(...fields: K[]) =>
  useStoreSelect<FetchStoreState<Dashboard>, K>(dashboardStore, ...fields)

// Reports
const topFlowStore = createFetchStore<TopFlowReportData>(reportUrls.topFlow, 'POST')

export const useTopFlowStore = <K extends keyof FetchStoreState<TopFlowReportData>>(
  ...fields: K[]
) => useStoreSelect<FetchStoreState<TopFlowReportData>, K>(topFlowStore, ...fields)

const incomeExpenseStore = createFetchStore<IncomeExpenseReportData>(
  reportUrls.incomeExpense,
  'POST',
)

export const useIncomeExpenseStore = <K extends keyof FetchStoreState<IncomeExpenseReportData>>(
  ...fields: K[]
) => useStoreSelect<FetchStoreState<IncomeExpenseReportData>, K>(incomeExpenseStore, ...fields)

import { createFetchStore, FetchStoreState } from '@/store/common/fetch'
import { useStoreSelect } from '@/hooks/use-store-select'
import { reportUrls } from '@/api/report'
import { Dashboard } from '@/types/dashboard'
import { ExpenseIncomeEntry, TopFlowEntry } from '@/types/report'

const dashboardStore = createFetchStore<Dashboard>(reportUrls.dashboard)

export const useDashboardStore = <K extends keyof FetchStoreState<Dashboard>>(...fields: K[]) =>
  useStoreSelect<FetchStoreState<Dashboard>, K>(dashboardStore, ...fields)

// Reports
const topFlowStore = createFetchStore<TopFlowEntry[]>(reportUrls.topFlow)

export const useTopFlowStore = <K extends keyof FetchStoreState<TopFlowEntry[]>>(...fields: K[]) =>
  useStoreSelect<FetchStoreState<TopFlowEntry[]>, K>(topFlowStore, ...fields)

const expenseIncomeStore = createFetchStore<ExpenseIncomeEntry[]>(reportUrls.expenseIncome)

export const useExpenseIncomeStore = <K extends keyof FetchStoreState<ExpenseIncomeEntry[]>>(
  ...fields: K[]
) => useStoreSelect<FetchStoreState<ExpenseIncomeEntry[]>, K>(expenseIncomeStore, ...fields)

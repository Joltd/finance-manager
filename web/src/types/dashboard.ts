import { Operation } from '@/types/operation'
import { BalanceChartData, IncomeExpenseGroup, TopFlowGroup } from '@/types/report'

export interface Dashboard {
  balance: BalanceChartData
  operations: Operation[]
  topExpenses: TopFlowGroup[]
  incomeExpense: IncomeExpenseGroup[]
}

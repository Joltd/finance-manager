import { Amount } from '@/types/common/amount'
import { Reference } from '@/types/common/reference'
import { DateRange } from '@/types/common/common'
import { AccountType } from '@/types/account'
import { Operation } from '@/types/operation'

// dashboard

export interface DashboardGroupBalance {
  group?: Reference
  balance: Amount
}

export interface DashboardMonthlyAvg {
  income: Amount
  expense: Amount
  net: Amount
}

export interface DashboardTopExpense {
  expense: Reference
  avg: Amount
}

export interface Dashboard {
  totalBalance: Amount
  groupBalances: DashboardGroupBalance[]
  avgMonthly: DashboardMonthlyAvg
  topExpenses: DashboardTopExpense[]
  recentOperations: Operation[]
}

// top-flow

export interface TopFlowFilter {
  date: DateRange
  type?: AccountType
  exclude?: string[]
  include?: string[]
}

export interface TopFlowEntry {
  other: boolean
  account?: Reference
  amount: Amount
}

export interface TopFlowGroup {
  date: string
  amount: Amount
  entries: TopFlowEntry[]
  otherEntries: TopFlowEntry[]
}

export interface TopFlowReport {
  groups: TopFlowGroup[]
}

// income-expense

export interface IncomeExpenseFilter {
  date: DateRange
  exclude?: string[]
  include?: string[]
}

export interface IncomeExpenseEntry {
  type: AccountType
  amount: Amount
}

export interface IncomeExpenseGroup {
  date: string
  entries: IncomeExpenseEntry[]
}

export interface IncomeExpenseReport {
  groups: IncomeExpenseGroup[]
}

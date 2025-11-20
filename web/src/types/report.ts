import { Amount } from '@/types/common/amount'
import { AccountReference, AccountType } from '@/types/account'
import { Reference } from '@/types/common/reference'

export interface TopFlowReportData {
  groups: TopFlowGroup[]
}

export interface TopFlowGroup {
  date: string
  amount: Amount
  entries: TopFlowEntry[]
  otherEntries: TopFlowEntry[]
}

export interface TopFlowEntry {
  other: boolean
  account?: AccountReference
  amount: Amount
}

export interface IncomeExpenseReportData {
  groups: IncomeExpenseGroup[]
}

export interface IncomeExpenseGroup {
  date: string
  entries: IncomeExpenseEntry[]
}

export interface IncomeExpenseEntry {
  type: AccountType
  amount: Amount
}

export interface CategoryEntry {
  account: AccountReference
  amount: Amount
}

export interface BalanceEntry {
  group?: Reference
  amount: Amount
}

export interface BalanceChartData {
  groups: BalanceGroupEntry[]
  otherGroups: BalanceGroupEntry[]
}

export interface BalanceGroupEntry {
  other?: boolean
  group?: Reference
  amount: Amount
  entries: BalanceAccountEntry[]
}

export interface BalanceAccountEntry {
  account: Reference
  amount: Amount
}

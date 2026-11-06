import { Amount } from '@/types/common/amount'
import { Reference } from '@/types/common/reference'
import { DateRange } from '@/types/common/common'
import { AccountType } from '@/types/account'
import { Operation } from '@/types/operation'

// dashboard

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
  excludeTags?: string[]
  includeTags?: string[]
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

// tagged-flow

export interface TaggedFlowFilter {
  tag: string
}

export interface TaggedFlowEntry {
  category: Reference
  amount: Amount
}

export interface TaggedFlowReport {
  total?: Amount
  entries: TaggedFlowEntry[]
}

// income-expense

export interface IncomeExpenseFilter {
  date: DateRange
  exclude?: string[]
  include?: string[]
  excludeTags?: string[]
  includeTags?: string[]
}

export interface IncomeExpenseEntry {
  type: AccountType
  amount: Amount
}

export interface IncomeExpenseGroup {
  date: string
  balance: Amount
  entries: IncomeExpenseEntry[]
}

export interface IncomeExpenseReport {
  groups: IncomeExpenseGroup[]
}

// pricing-comparison

export interface PricingComparisonSlice {
  date: DateRange
  country?: string
  city?: string
  store?: string
}

export interface PricingComparisonFilter {
  slices: PricingComparisonSlice[]
}

export interface PricingComparisonValue {
  amount?: Amount
  // percentage relative to the base (first) slice
  deviation?: number
}

export interface PricingComparisonColumn {
  // slice as it was sent and normalized by the backend
  slice: PricingComparisonSlice
  empty: boolean
  total: PricingComparisonValue
}

export interface PricingComparisonCategory {
  category: string
  // aligned with PricingComparisonReport.columns
  values: PricingComparisonValue[]
}

export interface PricingComparisonReport {
  columns: PricingComparisonColumn[]
  categories: PricingComparisonCategory[]
}

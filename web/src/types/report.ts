import { Amount } from '@/types/common/amount'
import { AccountReference } from '@/types/account'
import { Reference } from '@/types/common/reference'

export interface TopFlowEntry {
  date: string
  category1: TopFlowCategoryEntry
  category2: TopFlowCategoryEntry
  category3: TopFlowCategoryEntry
  other: TopFlowCategoryEntry
}

export interface TopFlowCategoryEntry {
  account?: AccountReference
  amount: Amount
}

export interface ExpenseIncomeEntry {
  date: string
  expense: Amount
  income: Amount
}

export interface CategoryEntry {
  account: AccountReference
  amount: Amount
}

export interface BalanceEntry {
  group?: Reference
  amount: Amount
}

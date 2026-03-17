import { AccountReference } from '@/types/account'
import { Amount } from '@/types/common/amount'

export type OperationType = 'EXPENSE' | 'INCOME' | 'EXCHANGE' | 'TRANSFER'

export interface Operation {
  id?: string
  date: string
  type: OperationType
  amountFrom: Amount
  accountFrom: AccountReference
  amountTo: Amount
  accountTo: AccountReference
  description?: string
  raw: string[]
}

export interface OperationGroup {
  date: string
  operations: Operation[]
}

export interface OperationFilter {
  date?: { from?: string; to?: string }
  type?: OperationType
  account?: string
  category?: string
  currency?: string
}

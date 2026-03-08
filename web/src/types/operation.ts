import { Account } from '@/types/account'
import { Amount } from '@/types/common/amount'

export type OperationType = 'EXPENSE' | 'INCOME' | 'EXCHANGE' | 'TRANSFER'

export interface OperationRecord {
  id: string | null
  date: string
  type: OperationType
  amountFrom: Amount
  accountFrom: Account
  amountTo: Amount
  accountTo: Account
  description?: string
  raw: string[]
}

export interface OperationGroup {
  date: string
  operations: OperationRecord[]
}

export interface OperationFilter {
  date?: { from?: string; to?: string }
  type?: OperationType
  account?: string
  category?: string
  currency?: string
}

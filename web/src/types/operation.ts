import { AccountReference } from '@/types/account'
import { Amount } from '@/types/common/amount'
import { Range } from '@/types/common/common'
import { Tag } from '@/types/tag'

export enum OperationType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  EXCHANGE = 'EXCHANGE',
  TRANSFER = 'TRANSFER',
}

export interface Operation {
  id?: string
  date: string
  type: OperationType
  amountFrom: Amount
  accountFrom: AccountReference
  amountTo: Amount
  accountTo: AccountReference
  description?: string
  raw: string
  tags: Tag[]
}

export interface OperationGroup {
  date: string
  operations: Operation[]
}

export interface OperationFilter {
  date?: Range<string>
  type?: OperationType
  account?: string
  category?: string
  currency?: string
  // amount?: Range<string>
  'amount.from'?: string
  'amount.to'?: string
}

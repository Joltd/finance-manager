import { AccountReference } from '@/types/account'
import { Amount } from '@/types/common/amount'
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
  'date.from'?: string
  'date.to'?: string
  type?: OperationType
  include?: string[]
  exclude?: string[]
  includeTags?: string[]
  excludeTags?: string[]
  currency?: string
  'amount.from'?: string
  'amount.to'?: string
}

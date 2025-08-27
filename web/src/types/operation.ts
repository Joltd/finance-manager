import { Account } from '@/types/account'
import { Amount } from '@/types/common/amount'
import { Embedding } from '@/types/common/embedding'

export enum OperationType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  EXCHANGE = 'EXCHANGE',
  TRANSFER = 'TRANSFER',
}

export interface OperationGroup {
  date: string
  operations: Operation[]
}

export interface Operation {
  id?: string
  date: string
  type: OperationType
  amountFrom: Amount
  accountFrom: Account
  amountTo: Amount
  accountTo: Account
  description?: string
  raw: string[]
  hint?: Embedding
}

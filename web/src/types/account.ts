import { z } from 'zod'
import { Reference, referenceSchema } from '@/types/common/reference'
import { Amount } from '@/types/common/amount'

export enum AccountType {
  ACCOUNT = 'ACCOUNT',
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
}

export interface AccountReference extends Reference {
  type: AccountType
  reviseDate?: string
}

export const accountReferenceSchema = referenceSchema.extend({
  type: z.enum(AccountType),
  reviseDate: z.string().optional(),
})

export interface AccountGroup {
  id?: string
  name: string
  deleted: boolean
}

export interface Account {
  id?: string
  name: string
  type: AccountType
  parser?: string
  group?: Reference
  deleted: boolean
  reviseDate?: string
  reportExclude: boolean
  externalId?: string
}

export interface Currency {
  id?: string
  name: string
  crypto: boolean
}

export interface AccountBalance {
  account: AccountReference
  balances: Amount[]
}

export interface AccountBalanceGroup {
  id?: string
  name?: string
  accounts: AccountBalance[]
}

import { Amount } from '@/types/common'
import z from 'zod'

export enum AccountType {
  ACCOUNT = 'ACCOUNT',
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
}

export interface AccountGroup {
  id?: string
  name: string
  deleted: boolean
}

export const accountGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
})

export interface Account {
  id?: string
  name: string
  type: AccountType
  parser?: string
  deleted: boolean
  group?: AccountGroup
}

export interface AccountReference {
  id: string
  name: string
  deleted: boolean
  type: AccountType
}

export const accountReferenceShema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.nativeEnum(AccountType),
  deleted: z.boolean(),
})

export interface AccountBalanceGroup {
  id?: string
  name?: string
  accounts?: AccountBalance[]
}

export interface AccountBalance {
  id: string
  name: string
  deleted: boolean
  balances: Amount[]
}

export interface Currency {
  id?: string
  name: string
  crypto: boolean
}

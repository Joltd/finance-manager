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
}

export const accountGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
})

export interface Account {
  id?: string
  name: string
  type: AccountType
  group?: AccountGroup
}

export const accountReferenceShema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.nativeEnum(AccountType),
  group: accountGroupSchema.optional(),
})

export interface AccountBalance {
  id: string
  name: string
  group?: AccountGroup
  balances: Amount[]
}

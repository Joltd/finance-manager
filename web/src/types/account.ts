import { Reference } from '@/types/common/reference'
import { Amount } from '@/types/common/amount'

export type AccountType = 'ACCOUNT' | 'EXPENSE' | 'INCOME'

export interface AccountReference extends Reference {
  type: AccountType
  reviseDate: string | undefined
}

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
  group?: AccountGroup
  deleted: boolean
  reviseDate?: string
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
  id: string | null
  name: string | null
  accounts: AccountBalance[]
}

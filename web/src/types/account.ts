import { Reference } from '@/types/common/reference'

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

import { AccountReference } from '@/types/account'

export type UserRole = 'ADMIN' | 'USER'

export interface Settings {
  version: string
  operationDefaultCurrency: string | undefined
  operationDefaultAccount: AccountReference | undefined
  operationCashAccount: AccountReference | undefined
}

export interface User {
  id: string
  name: string
  login: string
  role: UserRole
  settings: Settings
}
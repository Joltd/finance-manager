import { AccountReference } from '@/types/account'

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string
  name: string
  login: string
  role: UserRole
  deleted: boolean
  settings?: Settings
}

export interface Settings {
  version: string
  operationDefaultCurrency?: string
  operationDefaultAccount?: AccountReference
  operationCashAccount?: AccountReference
}

export interface AdminUser {
  id: string
  tenant?: string
  name: string
  login: string
  deleted: boolean
}

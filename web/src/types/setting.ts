import { AccountReference } from '@/types/account'

export interface Setting {
  version: string
  operationDefaultCurrency?: string
  operationDefaultAccount?: AccountReference
  operationCashAccount?: AccountReference
}

import { Amount } from "@/types/common";

export enum AccountType {
  ACCOUNT = 'ACCOUNT',
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
}

export interface Account {
  id?: string
  name: string
  type: AccountType
}

export interface AccountGroup {
  id?: string
  name: string
}

export interface AccountBalance {
  id: string
  name: string
  group?: AccountGroup
  balances: Amount[]
}
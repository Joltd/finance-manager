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
export interface Account {
  id: string | null
  name: string
  type: AccountType
  deleted: boolean
}

export type AccountType = 'ACCOUNT' | 'EXPENSE' | 'INCOME'

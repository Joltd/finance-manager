export interface Account {
  id: string | null
  name: string
  type: AccountType
  deleted: boolean
  reviseDate: string | null
}

export type AccountType = 'ACCOUNT' | 'EXPENSE' | 'INCOME'

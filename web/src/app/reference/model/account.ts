export interface Account {
  id: string | null
  name: string
  type: 'ACCOUNT' | 'EXPENSE' | 'INCOME'
  deleted: boolean
}

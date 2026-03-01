export type AccountType = 'ACCOUNT' | 'EXPENSE' | 'INCOME'

export interface AccountReference {
  id: string
  name: string
  deleted: boolean
  type: AccountType
  reviseDate: string | undefined
}
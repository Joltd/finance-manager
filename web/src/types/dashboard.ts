import { AccountBalance } from '@/types/account'
import { Amount, Reference } from './common'
import { Operation } from '@/types/operation'

export interface Dashboard {
  accountBalances: AccountBalance[]
  operations: Operation[]
  groupBalances: GroupBalance[]
  topExpenses: string[]
  incomeExpense: string[]
}

export interface GroupBalance {
  group?: Reference
  amount: Amount
}

import { AccountBalance } from '@/types/account'
import { Operation } from '@/types/operation'
import { Amount } from '@/types/common/amount'
import { Reference } from '@/types/common/reference'

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

import { AccountBalance } from '@/types/account'
import { Operation } from '@/types/operation'
import { Amount } from '@/types/common/amount'
import { Reference } from '@/types/common/reference'
import { BalanceEntry } from '@/types/report'

export interface Dashboard {
  accountBalances: AccountBalance[]
  operations: Operation[]
  groupBalances: BalanceEntry[]
  topExpenses: string[]
  incomeExpense: string[]
}

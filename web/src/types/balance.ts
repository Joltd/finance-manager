import { Account } from '@/types/account'

import { Amount } from '@/types/common/amount'

export interface Balance {
  account: Account
  amount: Amount
  date: string
}

import { Account } from '@/types/account'
import { Amount } from '@/types/common'

export interface Balance {
  account: Account
  amount: Amount
  date: string
}

import {Amount} from "../../common/model/amount";

export class AccountBalance {
  account!: string
  accountName!: string
  daysElapsed!: number
  balances: Amount[] = []
}

import {Amount} from "../../common/model/amount";

export class AccountBalance {
  account!: string
  balances: Amount[] = []
}

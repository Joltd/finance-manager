import {Amount} from "../../common/model/amount";

export interface Dashboard {
  defaultCurrencyAmount: Amount
  usdCashAmount: Amount | null
  cashFounds: Amount[]
}

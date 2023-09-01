import {Account} from "../../reference/model/account";
import {Amount} from "../../common/model/amount";

export interface CurrentFundsChart {
  entries: CurrentFundsChartEntry[]
}

export interface CurrentFundsChartEntry {
  account: Account
  commonAmount: Amount
  amounts: CurrentFundsChartEntryAmount[]
}

export interface CurrentFundsChartEntryAmount {
  amount: Amount,
  commonAmount: Amount
}

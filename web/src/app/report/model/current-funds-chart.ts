import {Account} from "../../reference/model/account";
import {Amount} from "../../common/model/amount";

export interface CurrentFundsChart {
  entries: CurrentFundsChartEntry[]
}

export interface CurrentFundsChartEntry {
  account: Account
  amounts: Amount[]
}

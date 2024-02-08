import { Amount } from "../../common/model/amount";
import { Account } from "../../reference/model/account";

export interface ApplicationSettings {
  version: string,
  operationDefaultCurrency: string | null
  operationDefaultAccount: Account | null
  operationCashAccount: Account | null
  candyIncomeAmount: Amount | null,
  candyIncomeFrequencyValue: number | null,
  candyIncomeFrequencyUnit: 'DAYS' | 'WEEKS' | 'MONTHS' | null,
  turnoverLastUpdate: string | null
}

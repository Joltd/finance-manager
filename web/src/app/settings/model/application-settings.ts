import {Reference} from "../../common/model/reference";
import { Amount } from "../../common/model/amount";

export interface ApplicationSettings {
  version: string,
  operationDefaultCurrency: string | null
  operationDefaultAccount: Reference | null
  operationCashAccount: Reference | null
  candyIncomeAmount: Amount | null,
  candyIncomeFrequencyValue: number | null,
  candyIncomeFrequencyUnit: 'DAYS' | 'WEEKS' | 'MONTHS' | null,
  turnoverLastUpdate: string | null
}

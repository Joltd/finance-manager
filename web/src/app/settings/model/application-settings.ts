import {Reference} from "../../common/model/reference";

export interface ApplicationSettings {
  version: string,
  operationDefaultCurrency: string | null
  operationDefaultAccount: Reference | null
  operationCashAccount: Reference | null
}

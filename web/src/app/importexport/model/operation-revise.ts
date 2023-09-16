import {Account} from "../../reference/model/account";
import {Reference} from "../../common/model/reference";
import {Operation} from "../../operation/model/operation";
import {ImportDataParsedEntry} from "./import-data";

export interface OperationRevise {
  id: string | null,
  dateFrom: string | null,
  dateTo: string | null,
  currency: string | null,
  account: Account,
  parser: Reference,
  dates: string[],
}

export interface OperationReviseEntry {
  id: string | null,
  date: string | null,
  operation: Operation | null,
  parsedEntry: ImportDataParsedEntry | null,
}

import {Amount} from "../../common/model/amount";
import {Account} from "../../reference/model/account";
import {ImportDataParsedEntry} from "../../importexport/model/import-data";

export interface OperationPage {
  total: number
  page: number
  size: number
  operations: Operation[]
}

export interface Operation {
  id: string | null
  date: string
  type: OperationType
  amountFrom: Amount
  accountFrom: Account
  amountTo: Amount
  accountTo: Account,
  description: string | null
}

export type OperationType = 'EXCHANGE' | 'TRANSFER' | 'EXPENSE' | 'INCOME'

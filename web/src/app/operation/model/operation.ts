import {Amount} from "../../common/model/amount";
import {Account} from "../../reference/model/account";

export interface OperationPage {
  total: number
  page: number
  size: number
  operations: Operation[]
}

export interface Operation {
  id: string | null
  date: string
  amountFrom: Amount
  accountFrom: Account
  amountTo: Amount
  accountTo: Account,
  description: string
}

export function isExpense(operation: Operation): boolean {
  return operation.accountFrom?.type == 'ACCOUNT' && operation.accountTo?.type == 'EXPENSE'
}

export function isIncome(operation: Operation): boolean {
  return operation.accountFrom?.type == 'INCOME' && operation.accountTo?.type == 'ACCOUNT'
}

export function isExchange(operation: Operation): boolean {
  return !isExpense(operation) && !isIncome(operation)
}

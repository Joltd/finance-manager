import { Amount } from "@/types/amount";
import { Account } from "@/types/account";

export enum OperationType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  EXCHANGE = 'EXCHANGE',
  TRANSFER = 'TRANSFER',
}

export interface Operation {
  id?: string
  date: string
  type: OperationType
  amountFrom: Amount
  accountFrom: Account
  amountTo: Amount
  accountTo: Account
  description?: string
}
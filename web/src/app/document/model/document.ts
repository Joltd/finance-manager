import {Amount} from "../../common/model/amount";

export interface Document {
  id: string | null
  date: string
}

export interface DocumentExpense extends Document {
  id: string
  date: string
  description: string
  amount: Amount
  account: string
  accountName: string
  expenseCategory: string
  expenseCategoryName: string
}

export interface DocumentIncome extends Document {
  id: string
  date: string
  description: string
  amount: Amount
  account: string
  accountName: string
  incomeCategory: string
  incomeCategoryName: string
}

export interface DocumentExchange extends Document {
  id: string
  date: string
  description: string
  accountFrom: string
  accountFromName: string
  amountFrom: Amount
  accountTo: string
  accountToName: string
  amountTo: Amount
  commissionExpenseCategory: string | null
  commissionExpenseCategoryName: string | null
  commissionAmount: Amount | null
}

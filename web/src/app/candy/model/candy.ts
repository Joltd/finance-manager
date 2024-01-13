import { Amount } from "../../common/model/amount";

export interface CandyDashboard {
  balanceUsd: Amount
  balance: Amount
  lastExpenses: CandyExpense[]
}

export interface CandyExpense {
  id: string
  date: string
  amountUsd: Amount
  amount: Amount
  comment: string
}

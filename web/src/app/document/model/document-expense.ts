import {Amount} from "../../common/model/amount";

export class DocumentExpense {
  id!: string
  date!: string
  description!: string
  amount!: Amount
  account!: string
  expenseCategory!: string
}

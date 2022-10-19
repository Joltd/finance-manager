import {Amount} from "../../common/model/amount";

export class DocumentIncome {
  id!: string
  date!: string
  description!: string
  amount!: Amount
  account!: string
  incomeCategory!: string
}

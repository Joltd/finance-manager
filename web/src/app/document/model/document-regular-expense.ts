import {Amount} from "../../common/model/amount";

export class DocumentRegularExpense {
  id!: string
  date!: string
  items: DocumentRegularExpenseItem[] = []
}

export class DocumentRegularExpenseItem {
  amount!: Amount
  account!: string
  category!: string
}

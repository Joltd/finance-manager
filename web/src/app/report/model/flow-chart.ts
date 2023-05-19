import { Amount } from "src/app/common/model/amount";

export class FlowChart {
  entries: FlowChartEntry[] = []
}

export class FlowChartEntry {
  date!: string
  type!: 'expense' | 'income'
  category!: string
  account!: string
  amount!: Amount
  commonAmount!: Amount
}

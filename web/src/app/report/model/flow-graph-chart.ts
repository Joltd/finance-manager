import {Amount} from "../../common/model/amount";
import {Reference} from "../../common/model/reference";

export class FlowGraphChart {
  nodes: FlowGraphChartNode[] = []
  links: FlowGraphChartLink[] = []
}

export class FlowGraphChartNode {
  id!: string
  direction!: string
  date!: string
  amount: Amount | null = null
  targetAmount: Amount | null = null
  category: Reference | null = null
  amountFrom: Amount | null = null
  amountTo: Amount | null = null
  rate: number | null = null
}

export class FlowGraphChartLink {
  source!: string
  target!: string
  date!: string
  exchange!: boolean
  amount: Amount | null = null
  rate: number | null = null
}

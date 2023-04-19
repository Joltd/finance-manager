import {Amount} from "../../common/model/amount";

export class FlowGraphChart {
  nodes: FlowGraphChartNode[] = []
  links: FlowGraphChartLink[] = []
}

export class FlowGraphChartNode {
  id!: string
  direction!: string
  date!: string
  amount!: Amount
  outside: boolean = false
}

export class FlowGraphChartLink {
  source!: string
  target!: string
  amount: Amount | null = null
}

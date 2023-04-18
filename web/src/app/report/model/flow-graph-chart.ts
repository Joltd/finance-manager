export class FlowGraphChart {
  nodes: FlowGraphChartNode[] = []
  links: FlowGraphChartLink[] = []
}

export class FlowGraphChartNode {
  id!: string
  direction!: string
  date!: string
  amount!: string
}

export class FlowGraphChartLink {
  source!: string
  target!: string
  amount!: number
}

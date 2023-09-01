
export interface FlowChart {
  dates: string[]
  series: FlowChartSeries[]
}

export interface FlowChartSeries {
  id: string,
  name: string,
  values: number[]
}

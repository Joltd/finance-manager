
export interface FlowChart {
  dates: string[]
  series: FlowChartSeries[]
}

export interface FlowChartSeries {
  name: string,
  values: number[]
}

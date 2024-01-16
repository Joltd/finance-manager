export interface FlowChart {
  groups: FlowChartGroup[]
}

export interface FlowChartGroup {
  date: string
  entries: FlowChartEntry[]
}

export interface FlowChartEntry {
  id: string
  name: string
  value: number
  color: string
}

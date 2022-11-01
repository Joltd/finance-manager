import {FlowChartSeries} from "./flow-chart-series";

export class FlowChart {
  dates: string[] = []
  expenses: FlowChartSeries[] = []
  totalExpense!: FlowChartSeries
  incomes: FlowChartSeries[] = []
}

import {Amount} from "../../common/model/amount";

export class FlowChartSeries {
  type!: string
  category!: string
  amounts: Amount[] = []
}

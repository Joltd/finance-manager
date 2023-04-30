import {Amount} from "../../common/model/amount";
import {GraphState} from "./graph-state";

export class Dashboard {
  graph!: GraphState
  funds: Fund[] = []
  fundsTotal: Amount = {value: 0, currency: 'USD'}
  fundsTotalSecondary: Amount = {value: 0, currency: 'RUB'}
}

export class Fund {
  amount!: Amount
  weight!: number
}

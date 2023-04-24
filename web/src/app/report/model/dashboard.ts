import {Amount, fromFractional} from "../../common/model/amount";

export class Dashboard {
  graphStatus!: GraphStatus
  funds: Fund[] = []
  fundsTotal: Amount = {value: 0, currency: 'USD'}
  fundsTotalSecondary: Amount = {value: 0, currency: 'RUB'}
}

export class GraphStatus {
  status!: 'ACTUAL' | 'REBUILD' | 'OUTDATED'
  date!: string
}

export class Fund {
  amount!: Amount
  weight!: number
}

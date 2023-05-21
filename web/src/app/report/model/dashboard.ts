import {Amount} from "../../common/model/amount";

export class Dashboard {
  funds: Fund[] = []
  fundsTotal: Amount = {value: 0, currency: 'USD'}
  fundsTotalSecondary: Amount = {value: 0, currency: 'RUB'}
}

export class Fund {
  account!: string
  amount!: Amount
  commonAmount!: Amount
}

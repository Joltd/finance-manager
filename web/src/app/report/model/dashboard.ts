import {AccountBalance} from "./account-balance";
import {FlowChart} from "./flow-chart";

export class Dashboard {
  balances: AccountBalance[] = []
  flowChart!: FlowChart
}

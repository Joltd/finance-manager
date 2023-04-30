import {FundSnapshotAccount} from "./fund-snapshor";

export class GraphState {
  status!: 'ACTUAL' | 'REBUILD' | 'OUTDATED'
  date!: string
  error: string | null = null
  accounts: FundSnapshotAccount[] = []
}

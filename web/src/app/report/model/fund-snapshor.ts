import {Amount} from "../../common/model/amount";
import {DocumentTyped} from "../../document/model/document-typed";
import {Reference} from "../../common/model/reference";

export class FundSnapshot {
  id!: string
  date!: string
  accounts: FundSnapshotAccount[] = []
}

export class FundSnapshotAccount{
  account!: Reference
  allocationQueues: AllocationQueue[] = []
}

export class AllocationQueue {
  amount!: Amount
  allocations: Allocation[] = []
}

export class Allocation {
  document!: DocumentTyped
  amount!: Amount
  weight!: number
}

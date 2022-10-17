import {Amount} from "../../common/model/amount";

export class ImportDataEntry {
  id!: string
  fromDb!: boolean
  fromFile!: Boolean
  systemId!: String
  date!: string
  direction!: 'IN' | 'OUT'
  amount!: Amount
  description!: string
  selected: boolean = false
}

import {Amount} from "../../common/model/amount";

export class ImportData {
  id!: string
  account!: string
  template!: string
  file!: string
  entries: ImportDataEntry[] = []
  documents: ImportDataRelatedDocument[] = []
}

export class ImportDataEntry {
  id!: string
  date!: string
  direction!: 'IN' | 'OUT'
  amount!: Amount
  description!: string
  imported: boolean = false
  selected: boolean = false
}

export class ImportDataFileResponse {
  filename!: string
}

export class ImportDataRelatedDocument {
  id!: string
  date!: string
}

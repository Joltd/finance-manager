import {Reference} from "../../common/model/reference";
import {Account} from "../../reference/model/account";

export interface ImportData {
  id: string
  parser: Reference
  account: Account
  status: ImportDataStatus
  message: string | null
  progress: number
}

export type ImportDataStatus = 'NEW' | 'PREPARE_IN_PROGRESS' | 'PREPARE_DONE' | 'IMPORT_IN_PROGRESS' | 'IMPORT_DONE' | 'FAILED'

export interface ImportDataEntry {
  id: string
}

export interface ImportDataEntryPage {
  total: number
  page: number
  size: number
  entries: ImportDataEntry[]
}

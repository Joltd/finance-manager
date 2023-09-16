import {Reference} from "../../common/model/reference";
import {Account} from "../../reference/model/account";
import {Operation, OperationType} from "../../operation/model/operation";
import {Amount} from "../../common/model/amount";
import {CategoryMapping} from "./category-mapping";

export interface ImportData {
  id: string
  parser: Reference
  account: Account
  status: ImportDataStatus
  message: string | null
  progress: number
}

export type ImportDataStatus = 'NEW' | 'PREPARE_IN_PROGRESS' | 'PREPARE_DONE' | 'IMPORT_IN_PROGRESS' | 'IMPORT_DONE' | 'FAILED'

export type ImportOption = 'NONE' |'CREATE_NEW' |'SKIP' |'REPLACE'

export type ImportResult = 'NOT_IMPORTED' | 'DONE' | 'FAILED'

export interface ImportDataEntry {
  id: string
  parsedEntry: ImportDataParsedEntry
  suggestedOperation: Operation | null
  similarOperations: Operation[]
  matchedCategoryMappings: CategoryMapping[]
  preparationResult: boolean
  preparationError: string | null
  option: ImportOption
  importResult: ImportResult
  importError: string | null
}

export interface ImportDataEntryPage {
  total: number
  page: number
  size: number
  entries: ImportDataEntry[]
}

export interface ImportDataParsedEntry {
  rawEntries: string[]
  date: string
  type: OperationType
  accountFrom: Account | null
  amountFrom: Amount
  accountTo: Account | null
  amountTo: Amount
  description: string
}

export interface ImportDataState {
  id: string,
  status: ImportDataStatus,
  progress: number,
}

import {DocumentTyped} from "../../document/model/document-typed";
import {Amount} from "../../common/model/amount";
import {CategoryMapping} from "./category-mapping";

export class ImportData {
  id!: string
  parser!: string
  account!: string
  accountName!: string
  status!: 'NEW' | 'PREPARE_IN_PROGRESS' | 'PREPARE_DONE' | 'IMPORT_IN_PROGRESS' | 'IMPORT_DONE' | 'FAILED'
  message!: string | null
  progress!: number
}

export class ImportDataEntryPage {
  total!: number
  page!: number
  size!: number
  entries: ImportDataEntry[] = []
}

export class ImportDataEntry {
  id!: string
  parsedEntry!: ImportDataParsedEntry
  suggestedDocument: DocumentTyped | null = null
  existedDocuments: DocumentTyped[] = []
  matchedCategoryMappings: CategoryMapping[]  = []
  preparationResult!: boolean
  preparationError!: string
  option!: 'NONE' | 'CREATE_NEW' | 'SKIP' | 'REPLACE'
  importResult!: 'NOT_IMPORTED' | 'DONE' | 'FAILED'
  importError!: string
}

export class ImportDataParsedEntry {
  id!: string
  rawEntries!: String[]
  type!: string
  date!: string
  amount!: Amount | null
  description!: string
  amountFrom!: Amount | null
  amountTo!: Amount | null
}

import { Operation, OperationType } from '@/types/operation'
import { Account } from '@/types/account'
import { Amount, RangeValue } from '@/types/common'

export interface ImportData {
  id: string
  account: Account
  dateRange?: RangeValue<string>
  progress: boolean
  totals: ImportDataTotal[]
}

export interface ImportDataTotal {
  currency: string
  operation?: Amount
  suggested?: Amount
  parsed?: Amount
  actual?: Amount
  valid: boolean
}

export interface ImportDataEntryGroup {
  date: string
  valid?: boolean
  totals: ImportDataTotal[]
  entries: ImportDataEntry[]
}

export interface ImportDataEntry {
  id?: string
  linked: boolean
  operation?: Operation
  operationVisible?: boolean
  parsed?: ImportDataOperation
  parsedVisible?: boolean
  suggestions: ImportDataOperation[]
}

export interface ImportDataOperation {
  id: string
  date: string
  type: OperationType
  amountFrom: Amount
  accountFrom?: Account
  amountTo: Amount
  accountTo?: Account
  description?: string
  raw: string[]
  selected: boolean
  distance?: number
  rating?: SuggestionRating
}

export enum SuggestionRating {
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

// export interface ImportData {
//   id: string
//   account: Account
//   entries: ImportDataEntry[]
// }
//
// export interface ImportDataEntry {
//   id: string
//   progress: boolean
//   approved: boolean
//   operationId?: string
//   date?: string
//   type?: OperationType
//   amountFrom?: Amount
//   accountFrom?: Account
//   amountTo?: Amount
//   accountTo?: Account
//   description?: string
//
//   issues: string[]
//   raw?: string
//   parsed?: ImportDataParsedEntry
//   suggested?: Operation
//   persisted?: string
//   hidden: boolean
// }
//
// export interface ImportDataParsedEntry {
//   raw: string[]
//   date: string
//   type: OperationType
//   amountFrom: Amount
//   accountFrom?: Account
//   amountTo: Amount
//   accountTo?: Account
//   description?: string
// }
//
// export interface ImportDataOperation {
//   id: string
//   date: string
//   type: OperationType
//   amountFrom: Amount
//   accountFrom: Account
//   amountTo: Amount
//   accountTo: Account
//   description?: string
//   distance?: number
// }

export interface ImportDataSuggestion {
  suggestion: ImportDataOperation
  similar: ImportDataSuggestionSimilar[]
}

export interface ImportDataSuggestionSimilar {
  operation: Operation
  score: number
}

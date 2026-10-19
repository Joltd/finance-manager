import { Amount } from '@/types/common/amount'
import { AccountReference } from '@/types/account'
import { Operation, OperationType } from '@/types/operation'
import { DateRange, Embedding } from '@/types/common/common'

export enum SuggestionRating {
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

export enum ImportDataParsingStatus {
  CREATED = 'CREATED',
  PARSING = 'PARSING',
  INTERPRETATION = 'INTERPRETATION',
  LINKING = 'LINKING',
  CALCULATION = 'CALCULATION',
  DONE = 'DONE',
  FAILED = 'FAILED',
}

export interface ImportDataTotal {
  currency: string
  parsed: Amount
  /** @deprecated not calculated, totals are based on parsed only */
  suggested: Amount
  /** @deprecated not calculated, totals are based on parsed only */
  operation: Amount
  actual: Amount
  balance: Amount
  valid: boolean
}

export interface ImportData {
  id: string
  account: AccountReference
  currency?: string
  dateRange?: DateRange
  parsingStatus: ImportDataParsingStatus
  message?: string
  valid: boolean
  totals: ImportDataTotal[]
}

export interface ImportDataOperation {
  id?: string
  date: string
  type: OperationType
  amountFrom: Amount
  accountFrom?: AccountReference
  amountTo: Amount
  accountTo?: AccountReference
  description?: string
  raw: string
  hint?: Embedding
  selected: boolean
  distance?: number
  rating?: SuggestionRating
}

export interface ImportDataEntryOld {
  id?: string
  linked: boolean
  operation?: Operation
  operationVisible: boolean
  parsed?: ImportDataOperation
  parsedVisible: boolean
  suggestions: ImportDataOperation[]
}

export interface ImportDataEntryData {
  id: string
  date?: string
  type?: OperationType
  amountFrom?: Amount
  accountFrom?: AccountReference
  amountTo?: Amount
  accountTo?: AccountReference
  description?: string
  raw: string
}

export interface ImportDataEntry {
  entry?: ImportDataEntryData
  operation?: Operation
}

export interface ImportDataDay {
  date: string
  valid: boolean
  totals: ImportDataTotal[]
  entries: ImportDataEntry[]
}

import { Amount } from '@/types/common/amount'
import { AccountReference } from '@/types/account'
import { Operation, OperationType } from '@/types/operation'
import { DateRange, Embedding } from '@/types/common/common'

export type SuggestionRating = 'GOOD' | 'FAIR' | 'POOR'

export interface ImportDataTotal {
  currency: string
  parsed: Amount
  suggested: Amount
  operation: Amount
  actual: Amount
  balance: Amount
  valid: boolean
}

export interface ImportData {
  id: string
  account: AccountReference
  dateRange?: DateRange
  progress: boolean
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
  raw: string[]
  hint?: Embedding
  selected: boolean
  distance?: number
  rating?: SuggestionRating
}

export interface ImportDataEntry {
  id?: string
  linked: boolean
  operation?: Operation
  operationVisible: boolean
  parsed?: ImportDataOperation
  parsedVisible: boolean
  suggestions: ImportDataOperation[]
}

export interface ImportDataDay {
  date: string
  valid: boolean
  totals: ImportDataTotal[]
  entries: ImportDataEntry[]
}

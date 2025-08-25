import { Operation, OperationType } from '@/types/operation'
import { Account } from '@/types/account'
import { Amount, Embedding, RangeValue } from '@/types/common'

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
  hint?: Embedding
  selected: boolean
  distance?: number
  rating?: SuggestionRating
}

export enum SuggestionRating {
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

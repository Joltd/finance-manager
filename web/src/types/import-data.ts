import { Operation, OperationType } from "@/types/operation";
import { Account } from "@/types/account";
import { Amount, Reference } from "@/types/common";

export interface ImportData {
  id: string
  account: Account
  entries: ImportDataEntry[]
}

export interface ImportDataEntry {
  id: string
  progress: boolean
  approved: boolean
  operationId?: string
  date?: string
  type?: OperationType
  amountFrom?: Amount
  accountFrom?: Account
  amountTo?: Amount
  accountTo?: Account
  description?: string

  issues: string[]
  raw?: string
  parsed?: ImportDataParsedEntry
  suggested?: Operation
  persisted?: string
  hidden: boolean
}

export interface ImportDataParsedEntry {
  raw: string[]
  date: string
  type: OperationType
  amountFrom: Amount
  accountFrom?: Account
  amountTo: Amount
  accountTo?: Account
  description?: string
}

export interface ImportDataOperation {
  id: string
  date: string
  type: OperationType
  amountFrom: Amount
  accountFrom: Account
  amountTo: Amount
  accountTo: Account
  description?: string
  distance?: number
}
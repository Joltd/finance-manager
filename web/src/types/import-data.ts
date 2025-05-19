import { Operation, OperationType } from "@/types/operation";
import { Amount } from "@/types/amount";
import { Account } from "@/types/account";

export interface ImportDataEntry {
  id: string
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
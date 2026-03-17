import type { AccountReference } from '@/types/account'
import { AccountType } from '@/types/account'
import type { Amount } from '@/types/common/amount'
import type { OperationType } from '@/types/operation'

export const FROM_ACCOUNT_TYPE: Partial<Record<OperationType, AccountType>> = {
  EXPENSE: AccountType.ACCOUNT,
  INCOME: AccountType.INCOME,
  TRANSFER: AccountType.ACCOUNT,
}

export const TO_ACCOUNT_TYPE: Partial<Record<OperationType, AccountType>> = {
  EXPENSE: AccountType.EXPENSE,
  INCOME: AccountType.ACCOUNT,
  TRANSFER: AccountType.ACCOUNT,
}

export type OperationFormState = {
  type: OperationType
  date: Date
  accountFrom?: AccountReference
  accountTo?: AccountReference
  amount?: Amount
  amountFrom?: Amount
  amountTo?: Amount
  description: string
}

export const defaultFormState: OperationFormState = {
  type: 'EXCHANGE',
  date: new Date(),
  accountFrom: undefined,
  accountTo: undefined,
  amount: undefined,
  amountFrom: undefined,
  amountTo: undefined,
  description: '',
}

/**
 * Transitions form state to a new operation type:
 * - Clears accountFrom/accountTo if their account types are incompatible with the new type.
 * - Converts between single amount and amountFrom/amountTo for EXCHANGE ↔ other.
 */
export function transitType(form: OperationFormState, newType: OperationType): OperationFormState {
  const fromConstraint = FROM_ACCOUNT_TYPE[newType]
  const toConstraint = TO_ACCOUNT_TYPE[newType]

  const accountFrom =
    !fromConstraint || form.accountFrom?.type === fromConstraint ? form.accountFrom : undefined
  const accountTo =
    !toConstraint || form.accountTo?.type === toConstraint ? form.accountTo : undefined

  const wasExchange = form.type === 'EXCHANGE'
  const isExchange = newType === 'EXCHANGE'

  let { amount, amountFrom, amountTo } = form

  if (wasExchange && !isExchange) {
    // Collapse two amounts into one (use amountFrom as the single amount)
    amount = amountFrom
    amountFrom = undefined
    amountTo = undefined
  } else if (!wasExchange && isExchange) {
    // Expand single amount into two (copy to both sides)
    amountFrom = amount
    amountTo = amount
    amount = undefined
  }

  return { ...form, type: newType, accountFrom, accountTo, amount, amountFrom, amountTo }
}


import { z } from 'zod'

import { accountReferenceSchema, AccountType } from '@/types/account'
import { amountSchema } from '@/types/common/amount'
import { OperationType } from '@/types/operation'
import { tagSchema } from '@/types/tag'

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

export const operationFormSchema = z
  .object({
    type: z.enum(OperationType),
    date: z.date(),
    accountFrom: accountReferenceSchema.optional(),
    accountTo: accountReferenceSchema.optional(),
    amount: amountSchema.optional(),
    amountFrom: amountSchema.optional(),
    amountTo: amountSchema.optional(),
    description: z.string(),
    tags: z.array(tagSchema),
  })
  .superRefine((data, ctx) => {
    if (!data.accountFrom) {
      ctx.addIssue({ code: 'custom', path: ['accountFrom'], message: 'Required' })
    }
    if (!data.accountTo) {
      ctx.addIssue({ code: 'custom', path: ['accountTo'], message: 'Required' })
    }
    if (data.type === OperationType.EXCHANGE) {
      if (!data.amountFrom) {
        ctx.addIssue({ code: 'custom', path: ['amountFrom'], message: 'Required' })
      }
      if (!data.amountTo) {
        ctx.addIssue({ code: 'custom', path: ['amountTo'], message: 'Required' })
      }
    } else {
      if (!data.amount) {
        ctx.addIssue({ code: 'custom', path: ['amount'], message: 'Required' })
      }
    }
  })

export type OperationFormState = z.infer<typeof operationFormSchema>

export const defaultFormState: OperationFormState = {
  type: OperationType.EXCHANGE,
  date: new Date(),
  accountFrom: undefined,
  accountTo: undefined,
  amount: undefined,
  amountFrom: undefined,
  amountTo: undefined,
  description: '',
  tags: [],
}

/**
 * Transitions form state to a new operation type:
 * - Clears accountFrom/accountTo if their account types are incompatible with the new type.
 * - Converts between single amount and amountFrom/amountTo for EXCHANGE ↔ other.
 */
export function transitType(form: OperationFormState, newType: OperationType): OperationFormState {
  const fromConstraint = FROM_ACCOUNT_TYPE[newType]
  const toConstraint = TO_ACCOUNT_TYPE[newType]

  let rawFrom = form.accountFrom
  let rawTo = form.accountTo

  if (form.type === OperationType.INCOME && newType === OperationType.EXPENSE) {
    rawFrom = form.accountTo
    rawTo = undefined
  } else if (form.type === OperationType.EXPENSE && newType === OperationType.INCOME) {
    rawFrom = undefined
    rawTo = form.accountFrom
  }

  const accountFrom = !fromConstraint || rawFrom?.type === fromConstraint ? rawFrom : undefined
  const accountTo = !toConstraint || rawTo?.type === toConstraint ? rawTo : undefined

  const wasExchange = form.type === OperationType.EXCHANGE
  const isExchange = newType === OperationType.EXCHANGE

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

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { parseISO } from 'date-fns'

import { AccountReference, accountReferenceSchema, AccountType } from '@/types/account'
import { Amount, amountSchema } from '@/types/common/amount'
import { OperationType } from '@/types/operation'
import { Tag, tagSchema } from '@/types/tag'

export const FROM_ACCOUNT_TYPE: Partial<Record<OperationType, AccountType>> = {
  EXPENSE: AccountType.ACCOUNT,
  INCOME: AccountType.INCOME,
  TRANSFER: AccountType.ACCOUNT,
  EXCHANGE: AccountType.ACCOUNT,
}

export const TO_ACCOUNT_TYPE: Partial<Record<OperationType, AccountType>> = {
  EXPENSE: AccountType.EXPENSE,
  INCOME: AccountType.ACCOUNT,
  TRANSFER: AccountType.ACCOUNT,
  EXCHANGE: AccountType.ACCOUNT,
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
    } else {
      const constraint = FROM_ACCOUNT_TYPE[data.type]
      if (constraint && data.accountFrom.type !== constraint) {
        ctx.addIssue({
          code: 'custom',
          path: ['accountFrom'],
          message: 'Invalid account type for this operation',
        })
      }
    }

    if (!data.accountTo) {
      ctx.addIssue({ code: 'custom', path: ['accountTo'], message: 'Required' })
    } else {
      const constraint = TO_ACCOUNT_TYPE[data.type]
      if (constraint && data.accountTo.type !== constraint) {
        ctx.addIssue({
          code: 'custom',
          path: ['accountTo'],
          message: 'Invalid account type for this operation',
        })
      }
    }

    if (
      data.type === OperationType.TRANSFER &&
      data.accountFrom &&
      data.accountTo &&
      data.accountFrom.id === data.accountTo.id
    ) {
      ctx.addIssue({ code: 'custom', path: ['accountTo'], message: 'From and To accounts must differ' })
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

export const operationFormResolver = zodResolver(operationFormSchema)

export function createDefaultFormState(): OperationFormState {
  return {
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

interface OperationLike {
  type: OperationType
  date: string
  accountFrom?: AccountReference
  accountTo?: AccountReference
  amountFrom: Amount
  amountTo: Amount
  description?: string
  tags?: Tag[]
}

export function operationToFormState(source: OperationLike): OperationFormState {
  const isExchange = source.type === OperationType.EXCHANGE
  return {
    type: source.type,
    date: new Date(source.date + 'T00:00:00'),
    accountFrom: source.accountFrom,
    accountTo: source.accountTo,
    amount: !isExchange ? source.amountFrom : undefined,
    amountFrom: isExchange ? source.amountFrom : undefined,
    amountTo: isExchange ? source.amountTo : undefined,
    description: source.description ?? '',
    tags: source.tags ?? [],
  }
}

interface OperationFormPreset {
  type?: OperationType
  date?: string
  account?: AccountReference
  category?: AccountReference
  currency?: string
}

export function createPresetFormState(
  preset: OperationFormPreset,
  defaultCurrency?: string,
): OperationFormState {
  let state = createDefaultFormState()
  if (preset.type) {
    state = transitType(state, preset.type)
  }
  if (preset.date) {
    state = { ...state, date: parseISO(preset.date) }
  }
  const fromConstraint = FROM_ACCOUNT_TYPE[state.type]
  if (preset.account && (!fromConstraint || preset.account.type === fromConstraint)) {
    state = { ...state, accountFrom: preset.account }
  }
  const toConstraint = TO_ACCOUNT_TYPE[state.type]
  if (preset.category && (!toConstraint || preset.category.type === toConstraint)) {
    state = { ...state, accountTo: preset.category }
  }
  const currency = preset.currency ?? defaultCurrency
  if (currency) {
    if (state.type === OperationType.EXCHANGE) {
      state = {
        ...state,
        amountFrom: { value: 0, currency },
        amountTo: { value: 0, currency },
      }
    } else {
      state = { ...state, amount: { value: 0, currency } }
    }
  }
  return state
}

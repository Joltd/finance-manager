import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { parseISO } from 'date-fns'

import { AccountReference, accountReferenceSchema, AccountType } from '@/types/account'
import { Amount, amountSchema } from '@/types/common/amount'
import { OperationType } from '@/types/operation'
import { Tag, tagSchema } from '@/types/tag'

/**
 * Which side of the operation `account` is on: OUT = account is "from", IN = account is "to".
 */
export enum OperationDirection {
  OUT = 'OUT',
  IN = 'IN',
}

/** `account` is always a regular account; the counterpart type depends on the operation type. */
export const COUNTERPART_ACCOUNT_TYPE: Record<OperationType, AccountType> = {
  [OperationType.EXPENSE]: AccountType.EXPENSE,
  [OperationType.INCOME]: AccountType.INCOME,
  [OperationType.TRANSFER]: AccountType.ACCOUNT,
  [OperationType.EXCHANGE]: AccountType.ACCOUNT,
}

/** Expense and income have a fixed direction; transfer and exchange can be swapped. */
const FIXED_DIRECTION: Partial<Record<OperationType, OperationDirection>> = {
  [OperationType.EXPENSE]: OperationDirection.OUT,
  [OperationType.INCOME]: OperationDirection.IN,
}

export const operationFormBaseSchema = z.object({
  type: z.enum(OperationType),
  date: z.date(),
  direction: z.enum(OperationDirection),
  account: accountReferenceSchema.optional(),
  counterpart: accountReferenceSchema.optional(),
  amount: amountSchema.optional(),
  // EXCHANGE only: the amount on the counterpart side
  counterAmount: amountSchema.optional(),
  description: z.string(),
  tags: z.array(tagSchema),
})

export type OperationFormState = z.infer<typeof operationFormBaseSchema>

type OperationFormRefinementCtx = z.core.$RefinementCtx<OperationFormState>

function addIssue(ctx: OperationFormRefinementCtx, path: keyof OperationFormState, message: string) {
  ctx.addIssue({ code: 'custom', path: [path], message })
}

/**
 * Account type checks shared by the strict operation schema and lenient schemas built on the same
 * form state (e.g. the import entry form). Only validates the accounts that are present.
 */
export function refineOperationAccounts(data: OperationFormState, ctx: OperationFormRefinementCtx) {
  if (data.account && data.account.type !== AccountType.ACCOUNT) {
    addIssue(ctx, 'account', 'Invalid account type for this operation')
  }
  if (data.counterpart && data.counterpart.type !== COUNTERPART_ACCOUNT_TYPE[data.type]) {
    addIssue(ctx, 'counterpart', 'Invalid account type for this operation')
  }
  if (
    data.type === OperationType.TRANSFER &&
    data.account &&
    data.counterpart &&
    data.account.id === data.counterpart.id
  ) {
    addIssue(ctx, 'counterpart', 'From and To accounts must differ')
  }
}

export const operationFormSchema = operationFormBaseSchema.superRefine((data, ctx) => {
  if (!data.account) {
    addIssue(ctx, 'account', 'Required')
  }
  if (!data.counterpart) {
    addIssue(ctx, 'counterpart', 'Required')
  }
  refineOperationAccounts(data, ctx)

  if (!data.amount) {
    addIssue(ctx, 'amount', 'Required')
  }
  if (data.type === OperationType.EXCHANGE && !data.counterAmount) {
    addIssue(ctx, 'counterAmount', 'Required')
  }
})

export const operationFormResolver = zodResolver(operationFormSchema)

export function createDefaultFormState(): OperationFormState {
  return {
    type: OperationType.EXCHANGE,
    date: new Date(),
    direction: OperationDirection.OUT,
    account: undefined,
    counterpart: undefined,
    amount: undefined,
    counterAmount: undefined,
    description: '',
    tags: [],
  }
}

/**
 * Transitions form state to a new operation type:
 * - Keeps `account` (it is a regular account for every type).
 * - Clears `counterpart` if its account type is incompatible with the new type.
 * - Forces the direction for expense/income, keeps it for transfer/exchange.
 * - Copies `amount` into `counterAmount` when switching to exchange, drops it otherwise.
 */
export function transitType(form: OperationFormState, newType: OperationType): OperationFormState {
  const counterpart =
    form.counterpart?.type === COUNTERPART_ACCOUNT_TYPE[newType] ? form.counterpart : undefined
  const direction = FIXED_DIRECTION[newType] ?? form.direction
  const counterAmount =
    newType === OperationType.EXCHANGE ? (form.counterAmount ?? form.amount) : undefined

  return { ...form, type: newType, direction, counterpart, counterAmount }
}

interface OperationLike {
  type: OperationType
  date?: string
  accountFrom?: AccountReference
  accountTo?: AccountReference
  amountFrom?: Amount
  amountTo?: Amount
  description?: string
  tags?: Tag[]
}

/**
 * Resolves which side `accountId` is on. Without `accountId` (or when it matches the "from" side)
 * transfer/exchange are treated as outgoing, so an exchange within a single account loads as OUT.
 */
function resolveDirection(source: OperationLike, accountId?: string): OperationDirection {
  const fixed = FIXED_DIRECTION[source.type]
  if (fixed) return fixed
  if (
    accountId !== undefined &&
    source.accountFrom?.id !== accountId &&
    source.accountTo?.id === accountId
  ) {
    return OperationDirection.IN
  }
  return OperationDirection.OUT
}

/**
 * Converts an operation-like object (an operation or an import entry) into form state.
 * `accountId` picks which side becomes `account` for transfer/exchange.
 */
export function toFormState(source: OperationLike, accountId?: string): OperationFormState {
  const direction = resolveDirection(source, accountId)
  const out = direction === OperationDirection.OUT
  return {
    type: source.type,
    date: source.date ? parseISO(source.date) : new Date(),
    direction,
    account: out ? source.accountFrom : source.accountTo,
    counterpart: out ? source.accountTo : source.accountFrom,
    amount: out ? source.amountFrom : source.amountTo,
    counterAmount:
      source.type === OperationType.EXCHANGE
        ? out
          ? source.amountTo
          : source.amountFrom
        : undefined,
    description: source.description ?? '',
    tags: source.tags ?? [],
  }
}

export interface OperationFields {
  type: OperationType
  accountFrom?: AccountReference
  accountTo?: AccountReference
  amountFrom?: Amount
  amountTo?: Amount
}

/** Converts form state back into from/to fields of the request body. */
export function toOperationFields(form: OperationFormState): OperationFields {
  const out = form.direction === OperationDirection.OUT
  const counterAmount = form.type === OperationType.EXCHANGE ? form.counterAmount : form.amount
  return {
    type: form.type,
    accountFrom: out ? form.account : form.counterpart,
    accountTo: out ? form.counterpart : form.account,
    amountFrom: out ? form.amount : counterAmount,
    amountTo: out ? counterAmount : form.amount,
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
  if (preset.account?.type === AccountType.ACCOUNT) {
    state = { ...state, account: preset.account }
  }
  if (preset.category?.type === COUNTERPART_ACCOUNT_TYPE[state.type]) {
    state = { ...state, counterpart: preset.category }
  }
  const currency = preset.currency ?? defaultCurrency
  if (currency) {
    state = {
      ...state,
      amount: { value: 0, currency },
      counterAmount: state.type === OperationType.EXCHANGE ? { value: 0, currency } : undefined,
    }
  }
  return state
}

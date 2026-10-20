import { zodResolver } from '@hookform/resolvers/zod'
import { parseISO } from 'date-fns'

import { AccountReference } from '@/types/account'
import { ImportDataEntryData } from '@/types/import-data'
import {
  createPresetFormState,
  operationFormBaseSchema,
  OperationFormState,
  refineOperationAccounts,
  toFormState,
} from '@/app/(protected)/(user)/operation/operation-form'

/**
 * Lenient variant of the operation form schema: an import entry is a draft, so the counterpart
 * and amounts may stay empty. Only the import's own account is required (it is locked in the UI).
 */
export const importDataEntryFormSchema = operationFormBaseSchema.superRefine((data, ctx) => {
  if (!data.account) {
    ctx.addIssue({ code: 'custom', path: ['account'], message: 'Required' })
  }
  refineOperationAccounts(data, ctx)
})

export const importDataEntryFormResolver = zodResolver(importDataEntryFormSchema)

/**
 * Converts an import entry into form state with `account` pinned to the import's account.
 * An entry without a type keeps its parsed date, amount and description; the type is picked
 * by the user before the details are shown.
 */
export function entryToFormState(
  entry: ImportDataEntryData,
  mainAccount: AccountReference,
  defaultCurrency?: string,
): OperationFormState {
  if (!entry.type) {
    const preset = createPresetFormState({ account: mainAccount }, defaultCurrency)
    return {
      ...preset,
      date: entry.date ? parseISO(entry.date) : preset.date,
      amount: entry.amountFrom ?? preset.amount,
      counterAmount: undefined,
      description: entry.description ?? '',
    }
  }

  return {
    ...toFormState({ ...entry, type: entry.type }, mainAccount.id),
    account: mainAccount,
  }
}

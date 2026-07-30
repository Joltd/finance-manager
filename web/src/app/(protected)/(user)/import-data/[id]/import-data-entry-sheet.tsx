'use client'

import { useEffect, useState } from 'react'
import { Control, Controller, useForm, useWatch } from 'react-hook-form'
import { create } from 'zustand'

import { AccountInput } from '@/components/common/input/account-input'
import { TagInput } from '@/components/common/input/tag-input'
import { AmountInput } from '@/components/common/input/amount-input'
import { DateInput } from '@/components/common/input/date-input'
import { Stack } from '@/components/common/layout/stack'
import { RawDataDisclosure } from '@/components/common/raw-data-disclosure'
import { Typography } from '@/components/common/typography/typography'
import { OperationTypeInput } from '@/components/common/input/operation-type-input'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AccountType } from '@/types/account'
import { Operation, OperationType } from '@/types/operation'
import type { ImportDataEntry } from '@/types/import-data'
import {
  createDefaultFormState,
  createPresetFormState,
  operationFormResolver,
  OperationFormState,
  operationToFormState,
  transitType,
} from '@/app/(protected)/(user)/operation/operation-form'
import { useImportDataStore } from '@/store/import-data'
import { AccountUsage, useOperationPresetStore } from '@/store/operation-preset'
import { useUserStore } from '@/store/user'
import { FrequentAccounts } from '@/app/(protected)/(user)/operation/frequent-accounts'
import { cn } from '@/lib/utils'
import { ImportDataEntryCard } from './import-data-entry-card'
import { useImportDataActions } from '@/app/(protected)/(user)/import-data/[id]/import-data-actions'
import { formatDate } from 'date-fns'

// ---------------------------------------------------------------------------
// Type-specific field groups
// ---------------------------------------------------------------------------

interface TypeFieldsProps {
  control: Control<OperationFormState>
  accountUsages: AccountUsage[]
}

function amountFieldErrors(error?: { message?: string; currency?: { message?: string } }) {
  return [error, error?.currency].filter((e): e is { message?: string } => Boolean(e?.message))
}

function ExchangeFields({ control, accountUsages }: TypeFieldsProps) {
  return (
    <>
      <Controller
        name="accountFrom"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>From</FieldLabel>
            <FrequentAccounts
              usages={accountUsages}
              accountType={AccountType.ACCOUNT}
              onSelect={field.onChange}
            />
            <AccountInput
              id={field.name}
              type={AccountType.ACCOUNT}
              value={field.value}
              onChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Controller
        name="amountFrom"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Amount From</FieldLabel>
            <AmountInput
              id={field.name}
              value={field.value}
              onChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={amountFieldErrors(fieldState.error)} />
          </Field>
        )}
      />
      <Controller
        name="accountTo"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>To</FieldLabel>
            <FrequentAccounts
              usages={accountUsages}
              accountType={AccountType.ACCOUNT}
              onSelect={field.onChange}
            />
            <AccountInput
              id={field.name}
              type={AccountType.ACCOUNT}
              value={field.value}
              onChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Controller
        name="amountTo"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Amount To</FieldLabel>
            <AmountInput
              id={field.name}
              value={field.value}
              onChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={amountFieldErrors(fieldState.error)} />
          </Field>
        )}
      />
    </>
  )
}

function TransferFields({ control, accountUsages }: TypeFieldsProps) {
  return (
    <>
      <Controller
        name="accountFrom"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>From</FieldLabel>
            <FrequentAccounts
              usages={accountUsages}
              accountType={AccountType.ACCOUNT}
              onSelect={field.onChange}
            />
            <AccountInput
              id={field.name}
              type={AccountType.ACCOUNT}
              value={field.value}
              onChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Controller
        name="accountTo"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>To</FieldLabel>
            <FrequentAccounts
              usages={accountUsages}
              accountType={AccountType.ACCOUNT}
              onSelect={field.onChange}
            />
            <AccountInput
              id={field.name}
              type={AccountType.ACCOUNT}
              value={field.value}
              onChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Controller
        name="amount"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
            <AmountInput
              id={field.name}
              value={field.value}
              onChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={amountFieldErrors(fieldState.error)} />
          </Field>
        )}
      />
    </>
  )
}

function ExpenseFields({ control, accountUsages }: TypeFieldsProps) {
  return (
    <>
      <Controller
        name="accountFrom"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Account</FieldLabel>
            <FrequentAccounts
              usages={accountUsages}
              accountType={AccountType.ACCOUNT}
              onSelect={field.onChange}
            />
            <AccountInput
              id={field.name}
              type={AccountType.ACCOUNT}
              value={field.value}
              onChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Controller
        name="accountTo"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Category</FieldLabel>
            <FrequentAccounts
              usages={accountUsages}
              accountType={AccountType.EXPENSE}
              onSelect={field.onChange}
            />
            <AccountInput
              id={field.name}
              type={AccountType.EXPENSE}
              value={field.value}
              onChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Controller
        name="amount"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
            <AmountInput
              id={field.name}
              value={field.value}
              onChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={amountFieldErrors(fieldState.error)} />
          </Field>
        )}
      />
    </>
  )
}

function IncomeFields({ control, accountUsages }: TypeFieldsProps) {
  return (
    <>
      <Controller
        name="accountTo"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Account</FieldLabel>
            <FrequentAccounts
              usages={accountUsages}
              accountType={AccountType.ACCOUNT}
              onSelect={field.onChange}
            />
            <AccountInput
              id={field.name}
              type={AccountType.ACCOUNT}
              value={field.value}
              onChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Controller
        name="accountFrom"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Category</FieldLabel>
            <FrequentAccounts
              usages={accountUsages}
              accountType={AccountType.INCOME}
              onSelect={field.onChange}
            />
            <AccountInput
              id={field.name}
              type={AccountType.INCOME}
              value={field.value}
              onChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Controller
        name="amount"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
            <AmountInput
              id={field.name}
              value={field.value}
              onChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={amountFieldErrors(fieldState.error)} />
          </Field>
        )}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface ImportDataEntrySheetState {
  open: boolean
  entry: ImportDataEntry | null
  openSheet: (entry: ImportDataEntry) => void
  closeSheet: () => void
}

const useImportDataEntrySheetStore = create<ImportDataEntrySheetState>((set) => ({
  open: false,
  entry: null,
  openSheet: (entry) => set({ open: true, entry }),
  closeSheet: () => set({ open: false }),
}))

export function openImportDataEntrySheet(entry: ImportDataEntry) {
  useImportDataEntrySheetStore.getState().openSheet(entry)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ImportDataEntrySheet() {
  const { open, entry, closeSheet } = useImportDataEntrySheetStore()
  const { data: importData } = useImportDataStore()
  const { loading, saveOperation, link } = useImportDataActions()
  const presetStore = useOperationPresetStore()
  const userStore = useUserStore()
  const mainAccountId = importData?.account.id
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState<number | null>(null)
  const { control, getValues, handleSubmit, reset } = useForm<OperationFormState>({
    resolver: operationFormResolver,
    defaultValues: createDefaultFormState(),
  })
  const type = useWatch({ control, name: 'type' })

  useEffect(() => {
    if (!open || !entry) return

    if (entry.operation) {
      reset(operationToFormState(entry.operation))
    } else {
      const idx = entry.suggestions.findIndex((s) => s.selected)
      if (idx >= 0) {
        reset(operationToFormState(entry.suggestions[idx]))
      } else if (entry.parsed) {
        reset(operationToFormState(entry.parsed))
      } else {
        reset(
          createPresetFormState(presetStore, userStore.data?.settings?.operationDefaultCurrency),
        )
      }
    }
  }, [open, entry]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTypeChange = (newType: OperationType) => {
    reset(transitType(getValues(), newType))
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) closeSheet()
  }

  const handleSuggestionClick = (idx: number) => {
    if (!entry) return
    setSelectedSuggestionIdx(idx)
    reset(operationToFormState(entry.suggestions[idx]))
  }

  const hasOperation = !!entry?.operation
  const hasSuggestions = (entry?.suggestions.length ?? 0) > 0

  const buildOperationBody = (data: OperationFormState): Omit<Operation, 'raw'> => {
    const isExchange = data.type === OperationType.EXCHANGE
    return {
      id: entry?.operation?.id,
      date: formatDate(data.date, 'yyyy-MM-dd'),
      type: data.type,
      accountFrom: data.accountFrom!,
      accountTo: data.accountTo!,
      amountFrom: isExchange ? data.amountFrom! : data.amount!,
      amountTo: isExchange ? data.amountTo! : data.amount!,
      description: data.description || undefined,
      tags: data.tags,
    }
  }

  const onSubmit = async (data: OperationFormState) => {
    if (!entry) return
    const body = buildOperationBody(data)
    if (hasOperation) {
      await saveOperation(body)
    } else {
      await link(importData!.id, entry.id!, body)
    }
    if (body.accountFrom) {
      presetStore.registerAccountUsage(body.accountFrom)
    }
    if (body.accountTo && body.accountTo.id !== body.accountFrom?.id) {
      presetStore.registerAccountUsage(body.accountTo)
    }
    closeSheet()
  }
  const title = hasOperation ? 'Edit Operation' : 'New Operation'

  const actionLabel: string = hasOperation ? 'Save' : 'Commit'

  const showUnlink = hasOperation && !!entry?.parsed

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className={cn(hasSuggestions && 'sm:max-w-160')}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="contents">
          <Stack orientation="horizontal" gap={0} className="flex-1 min-h-0 overflow-hidden">
            {/* Suggestions panel */}
            {hasSuggestions && (
              <Stack gap={2} scrollable className="w-64 shrink-0 border-r px-4 pb-4">
                <Typography
                  variant="muted"
                  className="text-xs font-medium uppercase tracking-wide shrink-0 sticky top-0 bg-background pt-1 pb-1"
                >
                  Suggestions
                </Typography>
                {entry!.suggestions.map((suggestion, idx) => (
                  <ImportDataEntryCard
                    key={idx}
                    type={suggestion.type}
                    amountFrom={suggestion.amountFrom}
                    amountTo={suggestion.amountTo}
                    accountFrom={suggestion.accountFrom}
                    accountTo={suggestion.accountTo}
                    description={suggestion.description}
                    rating={suggestion.rating}
                    mainAccountId={mainAccountId}
                    active={(selectedSuggestionIdx === null && suggestion.selected) || selectedSuggestionIdx === idx}
                    recommended={suggestion.selected}
                    onClick={() => handleSuggestionClick(idx)}
                  />
                ))}
              </Stack>
            )}

            {/* Form column + footer buttons */}
            <Stack gap={0} className="flex-1 min-h-0">
              <Stack gap={4} scrollable className="flex-1 px-4 pb-4">
                <Controller
                  name="type"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Type</FieldLabel>
                      <OperationTypeInput
                        id={field.name}
                        value={field.value}
                        onChange={handleTypeChange}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                <Controller
                  name="date"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                      <DateInput
                        id={field.name}
                        value={field.value}
                        onChange={(date) => date && field.onChange(date)}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                {type === OperationType.EXCHANGE && (
                  <ExchangeFields control={control} accountUsages={presetStore.accountUsages} />
                )}
                {type === OperationType.TRANSFER && (
                  <TransferFields control={control} accountUsages={presetStore.accountUsages} />
                )}
                {type === OperationType.EXPENSE && (
                  <ExpenseFields control={control} accountUsages={presetStore.accountUsages} />
                )}
                {type === OperationType.INCOME && (
                  <IncomeFields control={control} accountUsages={presetStore.accountUsages} />
                )}

                <Controller
                  name="tags"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
                      <TagInput
                        id={field.name}
                        mode="multi"
                        allowCreate
                        value={field.value}
                        onChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                <RawDataDisclosure raw={entry?.parsed?.raw} />
              </Stack>

              <SheetFooter>
                {showUnlink && (
                  <Button type="button" variant="outline" disabled={loading}>
                    Unlink
                  </Button>
                )}
                <Button type="submit" disabled={loading}>
                  {actionLabel}
                </Button>
              </SheetFooter>
            </Stack>
          </Stack>
        </form>
      </SheetContent>
    </Sheet>
  )
}

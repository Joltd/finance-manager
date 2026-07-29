'use client'

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { create } from 'zustand'

import { AccountInput } from '@/components/common/input/account-input'
import { TagInput } from '@/components/common/input/tag-input'
import { AmountInput } from '@/components/common/input/amount-input'
import { DateInput } from '@/components/common/input/date-input'
import { Stack } from '@/components/common/layout/stack'
import { RawDataDisclosure } from '@/components/common/raw-data-disclosure'
import { Typography } from '@/components/common/typography/typography'
import { OperationTypeInput } from '@/components/common/input/operation-type-input'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AccountType } from '@/types/account'
import { Operation, OperationType } from '@/types/operation'
import type { ImportDataEntry } from '@/types/import-data'
import {
  createDefaultFormState,
  createPresetFormState,
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
  form: OperationFormState
  setForm: Dispatch<SetStateAction<OperationFormState>>
  accountUsages: AccountUsage[]
}

function ExchangeFields({ form, setForm, accountUsages }: TypeFieldsProps) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor="accountFrom">From</FieldLabel>
        <FrequentAccounts
          usages={accountUsages}
          accountType={AccountType.ACCOUNT}
          onSelect={(accountFrom) => setForm((f) => ({ ...f, accountFrom }))}
        />
        <AccountInput
          id="accountFrom"
          type={AccountType.ACCOUNT}
          value={form.accountFrom}
          onChange={(accountFrom) => setForm((f) => ({ ...f, accountFrom }))}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="amountFrom">Amount From</FieldLabel>
        <AmountInput
          id="amountFrom"
          value={form.amountFrom}
          onChange={(amountFrom) => setForm((f) => ({ ...f, amountFrom }))}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="accountTo">To</FieldLabel>
        <FrequentAccounts
          usages={accountUsages}
          accountType={AccountType.ACCOUNT}
          onSelect={(accountTo) => setForm((f) => ({ ...f, accountTo }))}
        />
        <AccountInput
          id="accountTo"
          type={AccountType.ACCOUNT}
          value={form.accountTo}
          onChange={(accountTo) => setForm((f) => ({ ...f, accountTo }))}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="amountTo">Amount To</FieldLabel>
        <AmountInput
          id="amountTo"
          value={form.amountTo}
          onChange={(amountTo) => setForm((f) => ({ ...f, amountTo }))}
        />
      </Field>
    </>
  )
}

function TransferFields({ form, setForm, accountUsages }: TypeFieldsProps) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor="accountFrom">From</FieldLabel>
        <FrequentAccounts
          usages={accountUsages}
          accountType={AccountType.ACCOUNT}
          onSelect={(accountFrom) => setForm((f) => ({ ...f, accountFrom }))}
        />
        <AccountInput
          id="accountFrom"
          type={AccountType.ACCOUNT}
          value={form.accountFrom}
          onChange={(accountFrom) => setForm((f) => ({ ...f, accountFrom }))}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="accountTo">To</FieldLabel>
        <FrequentAccounts
          usages={accountUsages}
          accountType={AccountType.ACCOUNT}
          onSelect={(accountTo) => setForm((f) => ({ ...f, accountTo }))}
        />
        <AccountInput
          id="accountTo"
          type={AccountType.ACCOUNT}
          value={form.accountTo}
          onChange={(accountTo) => setForm((f) => ({ ...f, accountTo }))}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="amount">Amount</FieldLabel>
        <AmountInput
          id="amount"
          value={form.amount}
          onChange={(amount) => setForm((f) => ({ ...f, amount }))}
        />
      </Field>
    </>
  )
}

function ExpenseFields({ form, setForm, accountUsages }: TypeFieldsProps) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor="accountFrom">Account</FieldLabel>
        <FrequentAccounts
          usages={accountUsages}
          accountType={AccountType.ACCOUNT}
          onSelect={(accountFrom) => setForm((f) => ({ ...f, accountFrom }))}
        />
        <AccountInput
          id="accountFrom"
          type={AccountType.ACCOUNT}
          value={form.accountFrom}
          onChange={(accountFrom) => setForm((f) => ({ ...f, accountFrom }))}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="accountTo">Category</FieldLabel>
        <FrequentAccounts
          usages={accountUsages}
          accountType={AccountType.EXPENSE}
          onSelect={(accountTo) => setForm((f) => ({ ...f, accountTo }))}
        />
        <AccountInput
          id="accountTo"
          type={AccountType.EXPENSE}
          value={form.accountTo}
          onChange={(accountTo) => setForm((f) => ({ ...f, accountTo }))}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="amount">Amount</FieldLabel>
        <AmountInput
          id="amount"
          value={form.amount}
          onChange={(amount) => setForm((f) => ({ ...f, amount }))}
        />
      </Field>
    </>
  )
}

function IncomeFields({ form, setForm, accountUsages }: TypeFieldsProps) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor="accountTo">Account</FieldLabel>
        <FrequentAccounts
          usages={accountUsages}
          accountType={AccountType.ACCOUNT}
          onSelect={(accountTo) => setForm((f) => ({ ...f, accountTo }))}
        />
        <AccountInput
          id="accountTo"
          type={AccountType.ACCOUNT}
          value={form.accountTo}
          onChange={(accountTo) => setForm((f) => ({ ...f, accountTo }))}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="accountFrom">Category</FieldLabel>
        <FrequentAccounts
          usages={accountUsages}
          accountType={AccountType.INCOME}
          onSelect={(accountFrom) => setForm((f) => ({ ...f, accountFrom }))}
        />
        <AccountInput
          id="accountFrom"
          type={AccountType.INCOME}
          value={form.accountFrom}
          onChange={(accountFrom) => setForm((f) => ({ ...f, accountFrom }))}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="amount">Amount</FieldLabel>
        <AmountInput
          id="amount"
          value={form.amount}
          onChange={(amount) => setForm((f) => ({ ...f, amount }))}
        />
      </Field>
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
  const [form, setForm] = useState<OperationFormState>(createDefaultFormState)
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState<number | null>(null)

  useEffect(() => {
    if (!open || !entry) return

    if (entry.operation) {
      setSelectedSuggestionIdx(null)
      setForm(operationToFormState(entry.operation))
    } else {
      const idx = entry.suggestions.findIndex((s) => s.selected)
      if (idx >= 0) {
        setSelectedSuggestionIdx(idx)
        setForm(operationToFormState(entry.suggestions[idx]))
      } else if (entry.parsed) {
        setSelectedSuggestionIdx(null)
        setForm(operationToFormState(entry.parsed))
      } else {
        setSelectedSuggestionIdx(null)
        setForm(createPresetFormState(presetStore, userStore.data?.settings?.operationDefaultCurrency))
      }
    }
  }, [open, entry]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTypeChange = (newType: OperationType) => {
    setForm((f) => transitType(f, newType))
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) closeSheet()
  }

  const handleSuggestionClick = (idx: number) => {
    if (!entry) return
    setSelectedSuggestionIdx(idx)
    setForm(operationToFormState(entry.suggestions[idx]))
  }

  const hasOperation = !!entry?.operation
  const hasSuggestions = (entry?.suggestions.length ?? 0) > 0

  const buildOperationBody = (): Omit<Operation, 'raw'> => {
    const isExchange = form.type === OperationType.EXCHANGE
    return {
      id: entry?.operation?.id,
      date: formatDate(form.date, 'yyyy-MM-dd'),
      type: form.type,
      accountFrom: form.accountFrom!,
      accountTo: form.accountTo!,
      amountFrom: isExchange ? form.amountFrom! : form.amount!,
      amountTo: isExchange ? form.amountTo! : form.amount!,
      description: form.description || undefined,
      tags: form.tags ?? [],
    }
  }

  const handleAction = async () => {
    if (!entry) return
    const body = buildOperationBody()
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
                  active={selectedSuggestionIdx === idx}
                  recommended={suggestion.selected}
                  onClick={() => handleSuggestionClick(idx)}
                />
              ))}
            </Stack>
          )}

          {/* Form column + footer buttons */}
          <Stack gap={0} className="flex-1 min-h-0">
            <Stack gap={4} scrollable className="flex-1 px-4 pb-4">
              <Field>
                <FieldLabel htmlFor="type">Type</FieldLabel>
                <OperationTypeInput id="type" value={form.type} onChange={handleTypeChange} />
              </Field>

              <Field>
                <FieldLabel htmlFor="date">Date</FieldLabel>
                <DateInput
                  id="date"
                  value={form.date}
                  onChange={(date) => date && setForm((f) => ({ ...f, date }))}
                />
              </Field>

              {form.type === OperationType.EXCHANGE && (
                <ExchangeFields form={form} setForm={setForm} accountUsages={presetStore.accountUsages} />
              )}
              {form.type === OperationType.TRANSFER && (
                <TransferFields form={form} setForm={setForm} accountUsages={presetStore.accountUsages} />
              )}
              {form.type === OperationType.EXPENSE && (
                <ExpenseFields form={form} setForm={setForm} accountUsages={presetStore.accountUsages} />
              )}
              {form.type === OperationType.INCOME && (
                <IncomeFields form={form} setForm={setForm} accountUsages={presetStore.accountUsages} />
              )}

              <Field>
                <FieldLabel htmlFor="tags">Tags</FieldLabel>
                <TagInput
                  id="tags"
                  mode="multi"
                  allowCreate
                  value={form.tags ?? []}
                  onChange={(tags) => setForm((f) => ({ ...f, tags }))}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </Field>

              <RawDataDisclosure raw={entry?.parsed?.raw} />
            </Stack>

            <SheetFooter>
              {showUnlink && (
                <Button variant="outline" disabled={loading}>
                  Unlink
                </Button>
              )}
              <Button onClick={handleAction} disabled={loading}>
                {actionLabel}
              </Button>
            </SheetFooter>
          </Stack>
        </Stack>
      </SheetContent>
    </Sheet>
  )
}

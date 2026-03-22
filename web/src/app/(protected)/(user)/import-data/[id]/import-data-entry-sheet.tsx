'use client'

import { useEffect, useState } from 'react'
import { create } from 'zustand'

import { AccountInput } from '@/components/common/input/account-input'
import { AmountInput } from '@/components/common/input/amount-input'
import { DateInput } from '@/components/common/input/date-input'
import { Stack } from '@/components/common/layout/stack'
import { Typography } from '@/components/common/typography/typography'
import { OperationTypeInput } from '@/components/common/input/operation-type-input'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AccountType } from '@/types/account'
import type { Operation, OperationType } from '@/types/operation'
import type { ImportDataEntry, ImportDataOperation } from '@/types/import-data'
import {
  defaultFormState,
  OperationFormState,
  transitType,
} from '@/app/(protected)/(user)/operation/operation-form'
import { useImportDataStore } from '@/store/import-data'
import { cn } from '@/lib/utils'
import { ImportDataEntryCard } from './import-data-entry-card'
import { useImportDataActions } from '@/app/(protected)/(user)/import-data/[id]/import-data-actions'

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
// Helpers
// ---------------------------------------------------------------------------

function suggestionToForm(source: ImportDataOperation): OperationFormState {
  const type = source.type
  const isExchange = type === 'EXCHANGE'
  return {
    type,
    date: new Date(source.date + 'T00:00:00'),
    accountFrom: source.accountFrom,
    accountTo: source.accountTo,
    amount: !isExchange ? source.amountFrom : undefined,
    amountFrom: isExchange ? source.amountFrom : undefined,
    amountTo: isExchange ? source.amountTo : undefined,
    description: source.description ?? '',
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ImportDataEntrySheet() {
  const { open, entry, closeSheet } = useImportDataEntrySheetStore()
  const { data: importData } = useImportDataStore()
  const { loading, saveOperation, link } = useImportDataActions()
  const mainAccountId = importData?.account.id
  const [form, setForm] = useState<OperationFormState>(defaultFormState)
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState<number | null>(null)

  useEffect(() => {
    if (!open || !entry) return

    if (entry.operation) {
      setSelectedSuggestionIdx(null)
      const op = entry.operation
      const type = op.type
      const isExchange = type === 'EXCHANGE'
      setForm({
        type,
        date: new Date(op.date + 'T00:00:00'),
        accountFrom: op.accountFrom,
        accountTo: op.accountTo,
        amount: !isExchange ? op.amountFrom : undefined,
        amountFrom: isExchange ? op.amountFrom : undefined,
        amountTo: isExchange ? op.amountTo : undefined,
        description: op.description ?? '',
      })
    } else {
      const idx = entry.suggestions.findIndex((s) => s.selected)
      if (idx >= 0) {
        setSelectedSuggestionIdx(idx)
        setForm(suggestionToForm(entry.suggestions[idx]))
      } else {
        setSelectedSuggestionIdx(null)
        setForm(defaultFormState)
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
    setForm(suggestionToForm(entry.suggestions[idx]))
  }

  const hasOperation = !!entry?.operation
  const hasSuggestions = (entry?.suggestions.length ?? 0) > 0

  const buildOperationBody = (): Omit<Operation, 'raw'> => {
    const isExchange = form.type === 'EXCHANGE'
    return {
      id: entry?.operation?.id,
      date: form.date.toISOString().split('T')[0],
      type: form.type,
      accountFrom: form.accountFrom!,
      accountTo: form.accountTo!,
      amountFrom: isExchange ? form.amountFrom! : form.amount!,
      amountTo: isExchange ? form.amountTo! : form.amount!,
      description: form.description || undefined,
    }
  }

  const handleAction = async () => {
    if (!entry) return
    if (hasOperation) {
      await saveOperation(buildOperationBody())
    } else {
      await link(importData!.id, entry.id!, buildOperationBody())
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
                <FieldLabel>Type</FieldLabel>
                <OperationTypeInput value={form.type} onChange={handleTypeChange} />
              </Field>

              <Field>
                <FieldLabel>Date</FieldLabel>
                <DateInput
                  value={form.date}
                  onChange={(date) => date && setForm((f) => ({ ...f, date }))}
                />
              </Field>

              {form.type === 'EXCHANGE' && (
                <>
                  <Field>
                    <FieldLabel>From</FieldLabel>
                    <AccountInput
                      type={AccountType.ACCOUNT}
                      value={form.accountFrom}
                      onChange={(accountFrom) => setForm((f) => ({ ...f, accountFrom }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Amount From</FieldLabel>
                    <AmountInput
                      value={form.amountFrom}
                      onChange={(amountFrom) => setForm((f) => ({ ...f, amountFrom }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>To</FieldLabel>
                    <AccountInput
                      type={AccountType.ACCOUNT}
                      value={form.accountTo}
                      onChange={(accountTo) => setForm((f) => ({ ...f, accountTo }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Amount To</FieldLabel>
                    <AmountInput
                      value={form.amountTo}
                      onChange={(amountTo) => setForm((f) => ({ ...f, amountTo }))}
                    />
                  </Field>
                </>
              )}

              {form.type === 'TRANSFER' && (
                <>
                  <Field>
                    <FieldLabel>From</FieldLabel>
                    <AccountInput
                      type={AccountType.ACCOUNT}
                      value={form.accountFrom}
                      onChange={(accountFrom) => setForm((f) => ({ ...f, accountFrom }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>To</FieldLabel>
                    <AccountInput
                      type={AccountType.ACCOUNT}
                      value={form.accountTo}
                      onChange={(accountTo) => setForm((f) => ({ ...f, accountTo }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Amount</FieldLabel>
                    <AmountInput
                      value={form.amount}
                      onChange={(amount) => setForm((f) => ({ ...f, amount }))}
                    />
                  </Field>
                </>
              )}

              {form.type === 'EXPENSE' && (
                <>
                  <Field>
                    <FieldLabel>Account</FieldLabel>
                    <AccountInput
                      type={AccountType.ACCOUNT}
                      value={form.accountFrom}
                      onChange={(accountFrom) => setForm((f) => ({ ...f, accountFrom }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Category</FieldLabel>
                    <AccountInput
                      type={AccountType.EXPENSE}
                      value={form.accountTo}
                      onChange={(accountTo) => setForm((f) => ({ ...f, accountTo }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Amount</FieldLabel>
                    <AmountInput
                      value={form.amount}
                      onChange={(amount) => setForm((f) => ({ ...f, amount }))}
                    />
                  </Field>
                </>
              )}

              {form.type === 'INCOME' && (
                <>
                  <Field>
                    <FieldLabel>Account</FieldLabel>
                    <AccountInput
                      type={AccountType.ACCOUNT}
                      value={form.accountTo}
                      onChange={(accountTo) => setForm((f) => ({ ...f, accountTo }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Category</FieldLabel>
                    <AccountInput
                      type={AccountType.INCOME}
                      value={form.accountFrom}
                      onChange={(accountFrom) => setForm((f) => ({ ...f, accountFrom }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Amount</FieldLabel>
                    <AmountInput
                      value={form.amount}
                      onChange={(amount) => setForm((f) => ({ ...f, amount }))}
                    />
                  </Field>
                </>
              )}

              <Field>
                <FieldLabel>Description</FieldLabel>
                <Input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </Field>
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

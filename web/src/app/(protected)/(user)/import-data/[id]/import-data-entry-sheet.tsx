'use client'

import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { create } from 'zustand'

import { DateInput } from '@/components/common/input/date-input'
import { Stack } from '@/components/common/layout/stack'
import { RawDataDisclosure } from '@/components/common/raw-data-disclosure'
import { Typography } from '@/components/common/typography/typography'
import { TypeTilePicker } from '@/components/common/input/type-tile-picker'
import { TagInput } from '@/components/common/input/tag-input'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ArrowLeftIcon } from 'lucide-react'
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
import {
  ExchangeFields,
  ExpenseFields,
  IncomeFields,
  OPERATION_TYPE_LABELS,
  OPERATION_TYPE_TILE_ITEMS,
  TransferFields,
} from '@/app/(protected)/(user)/operation/operation-sheet'
import { useImportDataStore } from '@/store/import-data'
import { useOperationPresetStore } from '@/store/operation-preset'
import { useUserStore } from '@/store/user'
import { cn } from '@/lib/utils'
import { ImportDataEntryCard } from './import-data-entry-card'
import { useImportDataActions } from '@/app/(protected)/(user)/import-data/[id]/import-data-actions'
import { formatDate } from 'date-fns'

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
  const [selectionEntry, setSelectionEntry] = useState<ImportDataEntry | null>(null)
  if (entry !== selectionEntry) {
    setSelectionEntry(entry)
    setSelectedSuggestionIdx(null)
  }
  const { control, getValues, handleSubmit, reset } = useForm<OperationFormState>({
    resolver: operationFormResolver,
    defaultValues: createDefaultFormState(),
  })
  const type = useWatch({ control, name: 'type' })

  const [step, setStep] = useState<'type' | 'details'>('details')

  useEffect(() => {
    if (!open || !entry) return

    if (entry.operation) {
      reset(operationToFormState(entry.operation))
      // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizes the step with the open/entry-keyed hydration in this same effect, same intentional reset pattern as forms-guide.md §6/§7
      setStep('details')
    } else {
      const idx = entry.suggestions.findIndex((s) => s.selected)
      if (idx >= 0) {
        reset(operationToFormState(entry.suggestions[idx]))
        setStep('details')
      } else if (entry.parsed) {
        reset(operationToFormState(entry.parsed))
        setStep('details')
      } else {
        reset(
          createPresetFormState(presetStore, userStore.data?.settings?.operationDefaultCurrency),
        )
        setStep('type')
      }
    }
  }, [open, entry]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTypeSelect = (newType: OperationType) => {
    reset(transitType(getValues(), newType))
    setStep('details')
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) closeSheet()
  }

  const handleSuggestionClick = (idx: number) => {
    if (!entry) return
    setSelectedSuggestionIdx(idx)
    reset(operationToFormState(entry.suggestions[idx]))
    setStep('details')
  }

  const hasOperation = !!entry?.operation
  const hasSuggestions = (entry?.suggestions.length ?? 0) > 0
  const isCreate = !hasOperation

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
  const title = `${hasOperation ? 'Edit' : 'New'} ${step === 'details' ? OPERATION_TYPE_LABELS[type] : ''}`

  const actionLabel: string = hasOperation ? 'Save' : 'Commit'

  const showUnlink = hasOperation && !!entry?.parsed

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className={cn(hasSuggestions && 'sm:max-w-160')}>
        <SheetHeader>
          <Stack orientation="horizontal" align="center" gap={2}>
            {step === 'details' && isCreate && (
              <Button type="button" variant="ghost" size="icon" onClick={() => setStep('type')}>
                <ArrowLeftIcon />
              </Button>
            )}
            <SheetTitle>{title}</SheetTitle>
          </Stack>
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
              {step === 'type' ? (
                <Stack gap={4} className="flex-1 px-4 pb-4">
                  <TypeTilePicker
                    items={OPERATION_TYPE_TILE_ITEMS}
                    value={type}
                    onChange={handleTypeSelect}
                    columns={2}
                  />
                </Stack>
              ) : (
              <Stack gap={4} scrollable className="flex-1 px-4 pb-4">
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
              )}

              {step === 'details' && (
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
              )}
            </Stack>
          </Stack>
        </form>
      </SheetContent>
    </Sheet>
  )
}

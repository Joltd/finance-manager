'use client'

import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { create } from 'zustand'
import { formatDate } from 'date-fns'
import { ArrowLeftIcon } from 'lucide-react'

import { importDataUrls } from '@/api/import-data'
import { TypeTilePicker } from '@/components/common/input/type-tile-picker'
import { Stack } from '@/components/common/layout/stack'
import { RawDataDisclosure } from '@/components/common/raw-data-disclosure'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useRequest } from '@/hooks/use-request'
import { useImportDataStore } from '@/store/import-data'
import { useOperationPresetStore } from '@/store/operation-preset'
import { useUserStore } from '@/store/user'
import { OperationType } from '@/types/operation'
import type { ImportDataEntryData, ImportDataEntryUpdate } from '@/types/import-data'
import {
  createDefaultFormState,
  OperationFormState,
  toOperationFields,
  transitType,
} from '@/app/(protected)/(user)/operation/operation-form'
import {
  DateField,
  DescriptionField,
  OPERATION_TYPE_LABELS,
  OPERATION_TYPE_TILE_ITEMS,
  OperationTypeFields,
} from '@/app/(protected)/(user)/operation/operation-fields'
import { entryToFormState, importDataEntryFormResolver } from './import-data-entry-form'

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface ImportDataEntrySheetState {
  open: boolean
  entry: ImportDataEntryData | null
  openSheet: (entry: ImportDataEntryData) => void
  closeSheet: () => void
}

const useImportDataEntrySheetStore = create<ImportDataEntrySheetState>((set) => ({
  open: false,
  entry: null,
  openSheet: (entry) => set({ open: true, entry }),
  closeSheet: () => set({ open: false }),
}))

export function openImportDataEntrySheet(entry: ImportDataEntryData) {
  useImportDataEntrySheetStore.getState().openSheet(entry)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ImportDataEntrySheet() {
  const { open, entry, closeSheet } = useImportDataEntrySheetStore()
  const { data: importData } = useImportDataStore()
  const presetStore = useOperationPresetStore()
  const userStore = useUserStore()
  const updateEntry = useRequest<void, ImportDataEntryUpdate, never, { id: string; entryId: string }>(
    importDataUrls.entryById,
  )

  const { control, getValues, handleSubmit, reset } = useForm<OperationFormState>({
    resolver: importDataEntryFormResolver,
    defaultValues: createDefaultFormState(),
  })
  const type = useWatch({ control, name: 'type' })

  const [step, setStep] = useState<'type' | 'details'>('details')

  useEffect(() => {
    if (!open || !entry || !importData) return
    reset(
      entryToFormState(
        entry,
        importData.account,
        importData.currency ?? userStore.data?.settings?.operationDefaultCurrency,
      ),
    )
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizes the step with the open/entry-keyed hydration in this same effect, same intentional reset pattern as forms-guide.md §6/§7
    setStep(entry.type ? 'details' : 'type')
  }, [open, entry]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTypeSelect = (newType: OperationType) => {
    reset(transitType(getValues(), newType))
    setStep('details')
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) closeSheet()
  }

  const onSubmit = async (data: OperationFormState) => {
    if (!entry || !importData) return
    await updateEntry.submit({
      pathParams: { id: importData.id, entryId: entry.id },
      body: {
        date: formatDate(data.date, 'yyyy-MM-dd'),
        ...toOperationFields(data),
        description: data.description || undefined,
      },
    })
    if (data.counterpart && data.counterpart.id !== data.account?.id) {
      presetStore.registerAccountUsage(data.counterpart)
    }
    closeSheet()
  }

  const title = `Edit ${step === 'details' ? OPERATION_TYPE_LABELS[type] : ''}`

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <Stack orientation="horizontal" align="center" gap={2}>
            {step === 'details' && (
              <Button type="button" variant="ghost" size="icon" onClick={() => setStep('type')}>
                <ArrowLeftIcon />
              </Button>
            )}
            <SheetTitle>{title}</SheetTitle>
          </Stack>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="contents">
          {step === 'type' ? (
            <Stack gap={4} className="flex-1 px-4">
              <TypeTilePicker
                items={OPERATION_TYPE_TILE_ITEMS}
                value={type}
                onChange={handleTypeSelect}
                columns={2}
              />
            </Stack>
          ) : (
            <Stack gap={4} scrollable className="flex-1 px-4">
              <DateField control={control} />
              <OperationTypeFields
                control={control}
                type={type}
                accountUsages={presetStore.accountUsages}
                accountLocked
              />
              <DescriptionField control={control} />
              <RawDataDisclosure raw={entry?.raw} />
            </Stack>
          )}

          {step === 'details' && (
            <SheetFooter>
              <Button type="submit" disabled={updateEntry.loading}>
                Save
              </Button>
            </SheetFooter>
          )}
        </form>
      </SheetContent>
    </Sheet>
  )
}

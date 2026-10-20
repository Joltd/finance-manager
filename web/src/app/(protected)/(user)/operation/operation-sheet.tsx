'use client'

import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { create } from 'zustand'
import { formatDate } from 'date-fns'
import { ArrowLeftIcon } from 'lucide-react'

import { operationUrls } from '@/api/operation'
import { TypeTilePicker } from '@/components/common/input/type-tile-picker'
import { Stack } from '@/components/common/layout/stack'
import { RawDataDisclosure } from '@/components/common/raw-data-disclosure'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { useRequest } from '@/hooks/use-request'
import { useOperationStore } from '@/store/operation'
import { OperationType } from '@/types/operation'
import {
  createDefaultFormState,
  createPresetFormState,
  operationFormResolver,
  OperationFormState,
  toFormState,
  toOperationFields,
  transitType,
} from '@/app/(protected)/(user)/operation/operation-form'
import {
  DateField,
  DescriptionField,
  OPERATION_TYPE_LABELS,
  OPERATION_TYPE_TILE_ITEMS,
  OperationTypeFields,
  TagsField,
} from '@/app/(protected)/(user)/operation/operation-fields'
import { useOperationPresetStore } from '@/store/operation-preset'
import { useUserStore } from '@/store/user'

export interface OpenOperationSheetOptions {
  readOnly?: boolean
}

interface OperationSheetState {
  open: boolean
  operationId?: string
  copy: boolean
  readOnly: boolean
  openSheet: (operationId?: string, options?: OpenOperationSheetOptions) => void
  openSheetForCopy: (operationId?: string) => void
  closeSheet: () => void
}

// The store is shared by every page that mounts OperationSheet, so each open
// call sets `readOnly` explicitly instead of inheriting it from a previous open.
const useOperationSheetStore = create<OperationSheetState>((set) => ({
  open: false,
  operationId: undefined,
  copy: false,
  readOnly: false,
  openSheet: (operationId, options) =>
    set({ open: true, copy: false, readOnly: options?.readOnly ?? false, operationId }),
  openSheetForCopy: (operationId) =>
    set({ open: true, copy: true, readOnly: false, operationId }),
  closeSheet: () => set({ open: false }),
}))

export function openOperationSheet(operationId?: string, options?: OpenOperationSheetOptions) {
  useOperationSheetStore.getState().openSheet(operationId, options)
}

export function openOperationSheetForCopy(operationId?: string) {
  useOperationSheetStore.getState().openSheetForCopy(operationId)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OperationSheet() {
  const { open, copy, readOnly, operationId, closeSheet } = useOperationSheetStore()
  const operationStore = useOperationStore()
  const userStore = useUserStore()
  const presetStore = useOperationPresetStore()
  const saveOperation = useRequest(operationUrls.root)

  const {
    control,
    handleSubmit,
    reset,
    getValues,
  } = useForm<OperationFormState>({
    resolver: operationFormResolver,
    defaultValues: createDefaultFormState(),
  })

  const type = useWatch({ control, name: 'type' })

  const [step, setStep] = useState<'type' | 'details'>('type')
  const isCreate = !operationId || copy

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizes the step with the open-keyed hydration below, same intentional reset pattern as forms-guide.md §6/§7
      setStep(operationId ? 'details' : 'type')
      if (operationId) {
        operationStore.setPathParams({ id: operationId })
        void operationStore.fetch()
      } else {
        operationStore.reset()
        reset(createPresetFormState(presetStore, userStore.data?.settings?.operationDefaultCurrency))
      }
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const operation = operationStore.data
    if (!operation) return
    reset(toFormState(operation))
  }, [operationStore.data]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTypeSelect = (newType: OperationType) => {
    reset(transitType(getValues(), newType))
    setStep('details')
  }

  const onSubmit = async (data: OperationFormState) => {
    await saveOperation.submit({
      body: {
        id: copy ? undefined : (operationId ?? undefined),
        date: formatDate(data.date, 'yyyy-MM-dd'),
        ...toOperationFields(data),
        description: data.description || undefined,
        raw: '',
        tags: data.tags,
      },
    })
    if (data.account) {
      presetStore.registerAccountUsage(data.account)
    }
    if (data.counterpart && data.counterpart.id !== data.account?.id) {
      presetStore.registerAccountUsage(data.counterpart)
    }
    closeSheet()
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) closeSheet()
  }

  const loading = operationStore.loading
  const typeLabel = step === 'details' ? OPERATION_TYPE_LABELS[type] : ''
  const title = readOnly ? typeLabel : `${operationId ? 'Edit' : 'New'} ${typeLabel}`

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
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
          {loading ? (
            <Stack align="center" justify="center" className="flex-1">
              <Spinner />
            </Stack>
          ) : step === 'type' ? (
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
              <DateField control={control} disabled={readOnly} />
              <OperationTypeFields
                control={control}
                type={type}
                accountUsages={presetStore.accountUsages}
                disabled={readOnly}
              />
              <TagsField control={control} disabled={readOnly} />
              <DescriptionField control={control} disabled={readOnly} />
              <RawDataDisclosure raw={operationStore.data?.raw} />
            </Stack>
          )}

          {step === 'details' && !readOnly && (
            <SheetFooter>
              <Button type="submit" disabled={saveOperation.loading || loading}>
                Save
              </Button>
            </SheetFooter>
          )}
        </form>
      </SheetContent>
    </Sheet>
  )
}

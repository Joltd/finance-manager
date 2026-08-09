'use client'

import { useEffect, useState } from 'react'
import { Control, Controller, useForm, useWatch } from 'react-hook-form'
import { create } from 'zustand'
import { formatDate } from 'date-fns'
import { ArrowLeftIcon } from 'lucide-react'

import { operationUrls } from '@/api/operation'
import { AccountInput } from '@/components/common/input/account-input'
import { TagInput } from '@/components/common/input/tag-input'
import { AmountInput } from '@/components/common/input/amount-input'
import { DateInput } from '@/components/common/input/date-input'
import { TypeTileItem, TypeTilePicker } from '@/components/common/input/type-tile-picker'
import { Stack } from '@/components/common/layout/stack'
import { RawDataDisclosure } from '@/components/common/raw-data-disclosure'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { useRequest } from '@/hooks/use-request'
import { useOperationStore } from '@/store/operation'
import { AccountType } from '@/types/account'
import { OperationType } from '@/types/operation'
import { OperationIcon } from '@/components/common/icon/operation-icon'
import {
  createDefaultFormState,
  createPresetFormState,
  operationFormResolver,
  OperationFormState,
  operationToFormState,
  transitType,
} from '@/app/(protected)/(user)/operation/operation-form'
import { AccountUsage, useOperationPresetStore } from '@/store/operation-preset'
import { useUserStore } from '@/store/user'
import { FrequentAccounts } from '@/app/(protected)/(user)/operation/frequent-accounts'

interface OperationSheetState {
  open: boolean
  operationId?: string
  copy: boolean
  openSheet: (operationId?: string) => void
  openSheetForCopy: (operationId?: string) => void
  closeSheet: () => void
}

const useOperationSheetStore = create<OperationSheetState>((set) => ({
  open: false,
  operationId: undefined,
  copy: false,
  openSheet: (operationId) => set({ open: true, copy: false, operationId }),
  openSheetForCopy: (operationId) => set({ open: true, copy: true, operationId }),
  closeSheet: () => set({ open: false }),
}))

export function openOperationSheet(operationId?: string) {
  useOperationSheetStore.getState().openSheet(operationId)
}

export function openOperationSheetForCopy(operationId?: string) {
  useOperationSheetStore.getState().openSheetForCopy(operationId)
}

// The amount schema nests currency errors under `.currency` while a missing
// amount is reported directly on the field itself — surface whichever applies.
export function amountFieldErrors(error?: { message?: string; currency?: { message?: string } }) {
  return [error, error?.currency].filter((e): e is { message?: string } => Boolean(e?.message))
}

// Exported so ImportDataEntrySheet's type tile step can reuse the same items.
export const OPERATION_TYPE_TILE_ITEMS: TypeTileItem<OperationType>[] = [
  { value: OperationType.EXCHANGE, label: 'Exchange', icon: <OperationIcon type={OperationType.EXCHANGE} colored className="size-10" /> },
  { value: OperationType.TRANSFER, label: 'Transfer', icon: <OperationIcon type={OperationType.TRANSFER} colored className="size-10" /> },
  { value: OperationType.EXPENSE, label: 'Expense', icon: <OperationIcon type={OperationType.EXPENSE} colored className="size-10" /> },
  { value: OperationType.INCOME, label: 'Income', icon: <OperationIcon type={OperationType.INCOME} colored className="size-10" /> },
]

export const OPERATION_TYPE_LABELS = Object.fromEntries(
  OPERATION_TYPE_TILE_ITEMS.map((item) => [item.value, item.label]),
) as Record<OperationType, string>

// ---------------------------------------------------------------------------
// Type-specific field groups
//
// Exported so other operation-editing forms sharing OperationFormState (e.g.
// ImportDataEntrySheet) can reuse the same field groups instead of
// duplicating them.
// ---------------------------------------------------------------------------

export interface TypeFieldsProps {
  control: Control<OperationFormState>
  accountUsages: AccountUsage[]
}

export function ExchangeFields({ control, accountUsages }: TypeFieldsProps) {
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

export function TransferFields({ control, accountUsages }: TypeFieldsProps) {
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

export function ExpenseFields({ control, accountUsages }: TypeFieldsProps) {
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

export function IncomeFields({ control, accountUsages }: TypeFieldsProps) {
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
// Component
// ---------------------------------------------------------------------------

export function OperationSheet() {
  const { open, copy, operationId, closeSheet } = useOperationSheetStore()
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
    reset(operationToFormState(operation))
  }, [operationStore.data]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTypeSelect = (newType: OperationType) => {
    reset(transitType(getValues(), newType))
    setStep('details')
  }

  const onSubmit = async (data: OperationFormState) => {
    const isExchange = data.type === OperationType.EXCHANGE
    await saveOperation.submit({
      body: {
        id: copy ? undefined : (operationId ?? undefined),
        date: formatDate(data.date, 'yyyy-MM-dd'),
        type: data.type,
        accountFrom: data.accountFrom,
        accountTo: data.accountTo,
        amountFrom: isExchange ? data.amountFrom : data.amount,
        amountTo: isExchange ? data.amountTo : data.amount,
        description: data.description || undefined,
        raw: '',
        tags: data.tags,
      },
    })
    if (data.accountFrom) {
      presetStore.registerAccountUsage(data.accountFrom)
    }
    if (data.accountTo && data.accountTo.id !== data.accountFrom?.id) {
      presetStore.registerAccountUsage(data.accountTo)
    }
    closeSheet()
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) closeSheet()
  }

  const loading = operationStore.loading

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
            <SheetTitle>
              {operationId ? 'Edit' : 'New'}{' '}
              {step === 'details' ? OPERATION_TYPE_LABELS[type] : ''}
            </SheetTitle>
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

              <RawDataDisclosure raw={operationStore.data?.raw} />
            </Stack>
          )}

          {step === 'details' && (
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

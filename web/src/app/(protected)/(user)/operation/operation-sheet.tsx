'use client'

import { useEffect, useState } from 'react'
import { Control, Controller, useForm } from 'react-hook-form'
import { create } from 'zustand'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { formatDate } from 'date-fns'

import { operationUrls } from '@/api/operation'
import { AccountInput } from '@/components/common/input/account-input'
import { TagInput } from '@/components/common/input/tag-input'
import { AmountInput } from '@/components/common/input/amount-input'
import { DateInput } from '@/components/common/input/date-input'
import { OperationTypeInput } from '@/components/common/input/operation-type-input'
import { Stack } from '@/components/common/layout/stack'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { useRequest } from '@/hooks/use-request'
import { useOperationStore } from '@/store/operation'
import { AccountType } from '@/types/account'
import { OperationType } from '@/types/operation'
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
function amountFieldErrors(error?: { message?: string; currency?: { message?: string } }) {
  return [error, error?.currency].filter((e): e is { message?: string } => Boolean(e?.message))
}

// ---------------------------------------------------------------------------
// Type-specific field groups
// ---------------------------------------------------------------------------

interface TypeFieldsProps {
  control: Control<OperationFormState>
  accountUsages: AccountUsage[]
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
// Component
// ---------------------------------------------------------------------------

interface OperationSheetProps {
  onSaved: () => void
}

export function OperationSheet({ onSaved }: OperationSheetProps) {
  const { open, copy, operationId, closeSheet } = useOperationSheetStore()
  const operationStore = useOperationStore()
  const [rawExpanded, setRawExpanded] = useState(false)
  const userStore = useUserStore()
  const presetStore = useOperationPresetStore()
  const saveOperation = useRequest(operationUrls.root)

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    watch,
  } = useForm<OperationFormState>({
    resolver: operationFormResolver,
    defaultValues: createDefaultFormState(),
  })

  const type = watch('type')

  useEffect(() => {
    setRawExpanded(false)
  }, [open])

  useEffect(() => {
    if (open) {
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

  const handleTypeChange = (newType: OperationType) => {
    reset(transitType(getValues(), newType))
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
    onSaved()
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
          <SheetTitle>{operationId ? 'Edit Operation' : 'New Operation'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="contents">
          {loading ? (
            <Stack align="center" justify="center" className="flex-1">
              <Spinner />
            </Stack>
          ) : (
            <Stack gap={4} scrollable className="flex-1 px-4">
              <Controller
                name="type"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Type</FieldLabel>
                    <OperationTypeInput id={field.name} value={field.value} onChange={handleTypeChange} />
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

              {operationStore.data?.raw && (
                <div>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setRawExpanded((v) => !v)}
                  >
                    {rawExpanded ? (
                      <ChevronDown className="size-3.5" />
                    ) : (
                      <ChevronRight className="size-3.5" />
                    )}
                    Raw source data
                  </button>
                  {rawExpanded && (
                    <pre className="mt-2 rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground whitespace-pre-wrap break-all">
                      {operationStore.data.raw}
                    </pre>
                  )}
                </div>
              )}
            </Stack>
          )}

          <SheetFooter>
            <Button type="submit" disabled={saveOperation.loading || loading}>
              Save
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { create } from 'zustand'
import { formatDate, parseISO } from 'date-fns'

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
  defaultFormState,
  FROM_ACCOUNT_TYPE,
  operationFormSchema,
  OperationFormState,
  TO_ACCOUNT_TYPE,
  transitType,
} from '@/app/(protected)/(user)/operation/operation-form'
import { useOperationPresetStore } from '@/store/operation-preset'
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

interface OperationSheetProps {
  onSaved: () => void
}

export function OperationSheet({ onSaved }: OperationSheetProps) {
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<OperationFormState>({
    resolver: zodResolver(operationFormSchema),
    defaultValues: defaultFormState,
  })

  const type = watch('type')

  useEffect(() => {
    if (open) {
      if (operationId) {
        operationStore.setPathParams({ id: operationId })
        void operationStore.fetch()
      } else {
        operationStore.reset()
        let state = defaultFormState
        if (presetStore.type) {
          state = transitType(state, presetStore.type)
        }
        if (presetStore.date) {
          state = { ...state, date: parseISO(presetStore.date) }
        }
        const fromConstraint = FROM_ACCOUNT_TYPE[state.type]
        if (
          presetStore.account &&
          (!fromConstraint || presetStore.account.type === fromConstraint)
        ) {
          state = { ...state, accountFrom: presetStore.account }
        }
        const toConstraint = TO_ACCOUNT_TYPE[state.type]
        if (presetStore.category && (!toConstraint || presetStore.category.type === toConstraint)) {
          state = { ...state, accountTo: presetStore.category }
        }
        const currency = presetStore.currency ?? userStore.data?.settings?.operationDefaultCurrency
        if (currency) {
          if (state.type === OperationType.EXCHANGE) {
            state = {
              ...state,
              amountFrom: { value: 0, currency },
              amountTo: { value: 0, currency },
            }
          } else {
            state = { ...state, amount: { value: 0, currency } }
          }
        }
        reset(state)
      }
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const operation = operationStore.data
    if (!operation) return
    const opType = operation.type
    const isExchange = opType === OperationType.EXCHANGE
    reset({
      type: opType,
      date: new Date(operation.date + 'T00:00:00'),
      accountFrom: operation.accountFrom,
      accountTo: operation.accountTo,
      amount: !isExchange ? operation.amountFrom : undefined,
      amountFrom: isExchange ? operation.amountFrom : undefined,
      amountTo: isExchange ? operation.amountTo : undefined,
      description: operation.description ?? '',
      tags: operation.tags ?? [],
    })
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
        raw: [],
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
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <OperationTypeInput value={field.value} onChange={handleTypeChange} />
                  )}
                />
              </Field>

              <Field>
                <FieldLabel>Date</FieldLabel>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <DateInput
                      value={field.value}
                      onChange={(date) => date && field.onChange(date)}
                    />
                  )}
                />
              </Field>

              {type === OperationType.EXCHANGE && (
                <>
                  <Field data-invalid={errors.accountFrom ? 'true' : undefined}>
                    <FieldLabel>From</FieldLabel>
                    <FrequentAccounts
                      usages={presetStore.accountUsages}
                      accountType={AccountType.ACCOUNT}
                      onSelect={(a) => setValue('accountFrom', a)}
                    />
                    <Controller
                      name="accountFrom"
                      control={control}
                      render={({ field }) => (
                        <AccountInput value={field.value} onChange={field.onChange} />
                      )}
                    />
                    <FieldError>{errors.accountFrom?.message}</FieldError>
                  </Field>

                  <Field data-invalid={errors.amountFrom ? 'true' : undefined}>
                    <FieldLabel>Amount From</FieldLabel>
                    <Controller
                      name="amountFrom"
                      control={control}
                      render={({ field, fieldState }) => (
                        <AmountInput
                          value={field.value}
                          onChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                        />
                      )}
                    />
                    <FieldError>
                      {errors.amountFrom?.message ?? errors.amountFrom?.currency?.message}
                    </FieldError>
                  </Field>

                  <Field data-invalid={errors.accountTo ? 'true' : undefined}>
                    <FieldLabel>To</FieldLabel>
                    <FrequentAccounts
                      usages={presetStore.accountUsages}
                      accountType={AccountType.ACCOUNT}
                      onSelect={(a) => setValue('accountTo', a)}
                    />
                    <Controller
                      name="accountTo"
                      control={control}
                      render={({ field }) => (
                        <AccountInput value={field.value} onChange={field.onChange} />
                      )}
                    />
                    <FieldError>{errors.accountTo?.message}</FieldError>
                  </Field>

                  <Field data-invalid={errors.amountTo ? 'true' : undefined}>
                    <FieldLabel>Amount To</FieldLabel>
                    <Controller
                      name="amountTo"
                      control={control}
                      render={({ field, fieldState }) => (
                        <AmountInput
                          value={field.value}
                          onChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                        />
                      )}
                    />
                    <FieldError>
                      {errors.amountTo?.message ?? errors.amountTo?.currency?.message}
                    </FieldError>
                  </Field>
                </>
              )}

              {type === OperationType.TRANSFER && (
                <>
                  <Field data-invalid={errors.accountFrom ? 'true' : undefined}>
                    <FieldLabel>From</FieldLabel>
                    <FrequentAccounts
                      usages={presetStore.accountUsages}
                      accountType={AccountType.ACCOUNT}
                      onSelect={(a) => setValue('accountFrom', a)}
                    />
                    <Controller
                      name="accountFrom"
                      control={control}
                      render={({ field }) => (
                        <AccountInput
                          type={AccountType.ACCOUNT}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <FieldError>{errors.accountFrom?.message}</FieldError>
                  </Field>

                  <Field data-invalid={errors.accountTo ? 'true' : undefined}>
                    <FieldLabel>To</FieldLabel>
                    <FrequentAccounts
                      usages={presetStore.accountUsages}
                      accountType={AccountType.ACCOUNT}
                      onSelect={(a) => setValue('accountTo', a)}
                    />
                    <Controller
                      name="accountTo"
                      control={control}
                      render={({ field }) => (
                        <AccountInput
                          type={AccountType.ACCOUNT}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <FieldError>{errors.accountTo?.message}</FieldError>
                  </Field>

                  <Field data-invalid={errors.amount ? 'true' : undefined}>
                    <FieldLabel>Amount</FieldLabel>
                    <Controller
                      name="amount"
                      control={control}
                      render={({ field, fieldState }) => (
                        <AmountInput
                          value={field.value}
                          onChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                        />
                      )}
                    />
                    <FieldError>
                      {errors.amount?.message ?? errors.amount?.currency?.message}
                    </FieldError>
                  </Field>
                </>
              )}

              {type === OperationType.EXPENSE && (
                <>
                  <Field data-invalid={errors.accountFrom ? 'true' : undefined}>
                    <FieldLabel>Account</FieldLabel>
                    <FrequentAccounts
                      usages={presetStore.accountUsages}
                      accountType={AccountType.ACCOUNT}
                      onSelect={(a) => setValue('accountFrom', a)}
                    />
                    <Controller
                      name="accountFrom"
                      control={control}
                      render={({ field }) => (
                        <AccountInput
                          type={AccountType.ACCOUNT}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <FieldError>{errors.accountFrom?.message}</FieldError>
                  </Field>

                  <Field data-invalid={errors.accountTo ? 'true' : undefined}>
                    <FieldLabel>Category</FieldLabel>
                    <FrequentAccounts
                      usages={presetStore.accountUsages}
                      accountType={AccountType.EXPENSE}
                      onSelect={(a) => setValue('accountTo', a)}
                    />
                    <Controller
                      name="accountTo"
                      control={control}
                      render={({ field }) => (
                        <AccountInput
                          type={AccountType.EXPENSE}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <FieldError>{errors.accountTo?.message}</FieldError>
                  </Field>

                  <Field data-invalid={errors.amount ? 'true' : undefined}>
                    <FieldLabel>Amount</FieldLabel>
                    <Controller
                      name="amount"
                      control={control}
                      render={({ field, fieldState }) => (
                        <AmountInput
                          value={field.value}
                          onChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                        />
                      )}
                    />
                    <FieldError>
                      {errors.amount?.message ?? errors.amount?.currency?.message}
                    </FieldError>
                  </Field>
                </>
              )}

              {type === OperationType.INCOME && (
                <>
                  <Field data-invalid={errors.accountTo ? 'true' : undefined}>
                    <FieldLabel>Account</FieldLabel>
                    <FrequentAccounts
                      usages={presetStore.accountUsages}
                      accountType={AccountType.ACCOUNT}
                      onSelect={(a) => setValue('accountTo', a)}
                    />
                    <Controller
                      name="accountTo"
                      control={control}
                      render={({ field }) => (
                        <AccountInput
                          type={AccountType.ACCOUNT}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <FieldError>{errors.accountTo?.message}</FieldError>
                  </Field>

                  <Field data-invalid={errors.accountFrom ? 'true' : undefined}>
                    <FieldLabel>Category</FieldLabel>
                    <FrequentAccounts
                      usages={presetStore.accountUsages}
                      accountType={AccountType.INCOME}
                      onSelect={(a) => setValue('accountFrom', a)}
                    />
                    <Controller
                      name="accountFrom"
                      control={control}
                      render={({ field }) => (
                        <AccountInput
                          type={AccountType.INCOME}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <FieldError>{errors.accountFrom?.message}</FieldError>
                  </Field>

                  <Field data-invalid={errors.amount ? 'true' : undefined}>
                    <FieldLabel>Amount</FieldLabel>
                    <Controller
                      name="amount"
                      control={control}
                      render={({ field, fieldState }) => (
                        <AmountInput
                          value={field.value}
                          onChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                        />
                      )}
                    />
                    <FieldError>
                      {errors.amount?.message ?? errors.amount?.currency?.message}
                    </FieldError>
                  </Field>
                </>
              )}

              <Field>
                <FieldLabel>Tags</FieldLabel>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <TagInput mode="multi" value={field.value} onChange={field.onChange} />
                  )}
                />
              </Field>

              <Field>
                <FieldLabel>Description</FieldLabel>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => <Input value={field.value} onChange={field.onChange} />}
                />
              </Field>
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

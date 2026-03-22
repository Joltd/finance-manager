'use client'

import { useEffect, useState } from 'react'
import { create } from 'zustand'

import { operationUrls } from '@/api/operation'
import { AccountInput } from '@/components/common/input/account-input'
import { AmountInput } from '@/components/common/input/amount-input'
import { DateInput } from '@/components/common/input/date-input'
import { OperationTypeInput } from '@/components/common/input/operation-type-input'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { useRequest } from '@/hooks/use-request'
import { useOperationStore } from '@/store/operation'
import { AccountType } from '@/types/account'
import type { OperationType } from '@/types/operation'
import {
  defaultFormState,
  OperationFormState,
  transitType,
} from '@/app/(protected)/(user)/operation/operation-form'
import { formatDate } from 'date-fns'

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
  const saveOperation = useRequest(operationUrls.root)
  const [form, setForm] = useState<OperationFormState>(defaultFormState)

  useEffect(() => {
    if (open) {
      if (operationId) {
        operationStore.setPathParams({ id: operationId })
        void operationStore.fetch()
      } else {
        operationStore.reset()
        setForm(defaultFormState)
      }
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const operation = operationStore.data
    if (!operation) return
    const type = operation.type
    const isExchange = type === 'EXCHANGE'
    setForm({
      type,
      date: new Date(operation.date + 'T00:00:00'),
      accountFrom: operation.accountFrom,
      accountTo: operation.accountTo,
      amount: !isExchange ? operation.amountFrom : undefined,
      amountFrom: isExchange ? operation.amountFrom : undefined,
      amountTo: isExchange ? operation.amountTo : undefined,
      description: operation.description ?? '',
    })
  }, [operationStore.data])

  const handleTypeChange = (newType: OperationType) => {
    setForm((f) => transitType(f, newType))
  }

  const handleSubmit = async () => {
    const isExchange = form.type === 'EXCHANGE'
    await saveOperation.submit({
      body: {
        id: copy ? undefined : (operationId ?? undefined),
        date: formatDate(form.date, 'yyyy-MM-dd'),
        type: form.type,
        accountFrom: form.accountFrom,
        accountTo: form.accountTo,
        amountFrom: isExchange ? form.amountFrom : form.amount,
        amountTo: isExchange ? form.amountTo : form.amount,
        description: form.description || undefined,
        raw: [],
      },
    })
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

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-col gap-4 px-4 flex-1 overflow-y-auto">
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
          </div>
        )}

        <SheetFooter>
          <Button onClick={() => void handleSubmit()} disabled={saveOperation.loading || loading}>
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

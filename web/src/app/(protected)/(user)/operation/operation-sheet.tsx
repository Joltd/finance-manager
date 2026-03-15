'use client'

import { useEffect, useState } from 'react'
import { create } from 'zustand'

import { operationUrls } from '@/api/operation'
import { AccountInput } from '@/components/common/input/account-input'
import { AmountInput } from '@/components/common/input/amount-input'
import { DateInput } from '@/components/common/input/date-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { useRequest } from '@/hooks/use-request'
import { useOperationStore } from '@/store/operation'
import type { AccountReference } from '@/types/account'
import { AccountType } from '@/types/account'
import type { Amount } from '@/types/common/amount'
import type { OperationType } from '@/types/operation'

interface OperationSheetState {
  open: boolean
  operationId?: string
  openSheet: (operationId?: string) => void
  closeSheet: () => void
}

const useOperationSheetStore = create<OperationSheetState>((set) => ({
  open: false,
  operationId: undefined,
  openSheet: (operationId) => set({ open: true, operationId }),
  closeSheet: () => set({ open: false }),
}))

export function openOperationSheet(operationId?: string) {
  useOperationSheetStore.getState().openSheet(operationId)
}

const FROM_ACCOUNT_TYPE: Partial<Record<OperationType, AccountType>> = {
  EXPENSE: AccountType.ACCOUNT,
  INCOME: AccountType.INCOME,
  TRANSFER: AccountType.ACCOUNT,
}

const TO_ACCOUNT_TYPE: Partial<Record<OperationType, AccountType>> = {
  EXPENSE: AccountType.EXPENSE,
  INCOME: AccountType.ACCOUNT,
  TRANSFER: AccountType.ACCOUNT,
}

type OperationFormState = {
  type: OperationType
  date: Date
  accountFrom?: AccountReference
  accountTo?: AccountReference
  amount?: Amount
  amountFrom?: Amount
  amountTo?: Amount
  description: string
}

const defaultFormState: OperationFormState = {
  type: 'EXCHANGE',
  date: new Date(),
  accountFrom: undefined,
  accountTo: undefined,
  amount: undefined,
  amountFrom: undefined,
  amountTo: undefined,
  description: '',
}

/**
 * Transitions form state to a new operation type:
 * - Clears accountFrom/accountTo if their account types are incompatible with the new type.
 * - Converts between single amount and amountFrom/amountTo for EXCHANGE ↔ other.
 */
function transitType(form: OperationFormState, newType: OperationType): OperationFormState {
  const fromConstraint = FROM_ACCOUNT_TYPE[newType]
  const toConstraint = TO_ACCOUNT_TYPE[newType]

  const accountFrom =
    !fromConstraint || form.accountFrom?.type === fromConstraint ? form.accountFrom : undefined
  const accountTo =
    !toConstraint || form.accountTo?.type === toConstraint ? form.accountTo : undefined

  const wasExchange = form.type === 'EXCHANGE'
  const isExchange = newType === 'EXCHANGE'

  let { amount, amountFrom, amountTo } = form

  if (wasExchange && !isExchange) {
    // Collapse two amounts into one (use amountFrom as the single amount)
    amount = amountFrom
    amountFrom = undefined
    amountTo = undefined
  } else if (!wasExchange && isExchange) {
    // Expand single amount into two (copy to both sides)
    amountFrom = amount
    amountTo = amount
    amount = undefined
  }

  return { ...form, type: newType, accountFrom, accountTo, amount, amountFrom, amountTo }
}

interface OperationSheetProps {
  onSaved: () => void
}

export function OperationSheet({ onSaved }: OperationSheetProps) {
  const { open, operationId, closeSheet } = useOperationSheetStore()
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
        id: operationId ?? undefined,
        date: form.date.toISOString().split('T')[0],
        type: form.type,
        accountFrom: form.accountFrom,
        accountTo: form.accountTo,
        amountFrom: isExchange ? form.amountFrom : form.amount,
        amountTo: isExchange ? form.amountTo : form.amount,
        description: form.description || undefined,
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
              <Select value={form.type} onValueChange={(v) => handleTypeChange(v as OperationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="EXCHANGE">Exchange</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                </SelectContent>
              </Select>
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

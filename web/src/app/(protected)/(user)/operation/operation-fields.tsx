'use client'

import { Control, Controller, useWatch } from 'react-hook-form'
import { ArrowDownIcon, ArrowUpDownIcon } from 'lucide-react'

import { AccountInput } from '@/components/common/input/account-input'
import { AmountInput } from '@/components/common/input/amount-input'
import { DateInput } from '@/components/common/input/date-input'
import { TagInput } from '@/components/common/input/tag-input'
import { TypeTileItem } from '@/components/common/input/type-tile-picker'
import { OperationIcon } from '@/components/common/icon/operation-icon'
import { Stack } from '@/components/common/layout/stack'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { AccountType } from '@/types/account'
import { OperationType } from '@/types/operation'
import { AccountUsage } from '@/store/operation-preset'
import {
  COUNTERPART_ACCOUNT_TYPE,
  OperationDirection,
  OperationFormState,
} from '@/app/(protected)/(user)/operation/operation-form'
import { FrequentAccounts } from '@/app/(protected)/(user)/operation/frequent-accounts'

// ---------------------------------------------------------------------------
// Shared building blocks for forms built on OperationFormState
// (OperationSheet and ImportDataEntrySheet).
// ---------------------------------------------------------------------------

export const OPERATION_TYPE_TILE_ITEMS: TypeTileItem<OperationType>[] = [
  { value: OperationType.EXCHANGE, label: 'Exchange', icon: <OperationIcon type={OperationType.EXCHANGE} colored className="size-10" /> },
  { value: OperationType.TRANSFER, label: 'Transfer', icon: <OperationIcon type={OperationType.TRANSFER} colored className="size-10" /> },
  { value: OperationType.EXPENSE, label: 'Expense', icon: <OperationIcon type={OperationType.EXPENSE} colored className="size-10" /> },
  { value: OperationType.INCOME, label: 'Income', icon: <OperationIcon type={OperationType.INCOME} colored className="size-10" /> },
]

export const OPERATION_TYPE_LABELS = Object.fromEntries(
  OPERATION_TYPE_TILE_ITEMS.map((item) => [item.value, item.label]),
) as Record<OperationType, string>

// The amount schema nests currency errors under `.currency` while a missing
// amount is reported directly on the field itself — surface whichever applies.
export function amountFieldErrors(error?: { message?: string; currency?: { message?: string } }) {
  return [error, error?.currency].filter((e): e is { message?: string } => Boolean(e?.message))
}

interface FormFieldProps {
  control: Control<OperationFormState>
  disabled?: boolean
}

export function DateField({ control, disabled }: FormFieldProps) {
  return (
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
            disabled={disabled}
            aria-invalid={fieldState.invalid}
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}

export function TagsField({ control, disabled }: FormFieldProps) {
  return (
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
            disabled={disabled}
            aria-invalid={fieldState.invalid}
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}

export function DescriptionField({ control, disabled }: FormFieldProps) {
  return (
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
            disabled={disabled}
            aria-invalid={fieldState.invalid}
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}

// ---------------------------------------------------------------------------
// Type-specific field groups
// ---------------------------------------------------------------------------

export interface OperationTypeFieldsProps {
  control: Control<OperationFormState>
  type: OperationType
  accountUsages: AccountUsage[]
  accountLocked?: boolean
  disabled?: boolean
}

export function OperationTypeFields({
  control,
  type,
  accountUsages,
  accountLocked = false,
  disabled = false,
}: OperationTypeFieldsProps) {
  const direction = useWatch({ control, name: 'direction' })
  const out = direction === OperationDirection.OUT
  const accountDisabled = disabled || accountLocked

  const accountField = (label: string) => (
    <AccountField
      control={control}
      name="account"
      label={label}
      accountType={AccountType.ACCOUNT}
      accountUsages={accountUsages}
      disabled={accountDisabled}
    />
  )
  const counterpartField = (label: string) => (
    <AccountField
      control={control}
      name="counterpart"
      label={label}
      accountType={COUNTERPART_ACCOUNT_TYPE[type]}
      accountUsages={accountUsages}
      disabled={disabled}
    />
  )

  switch (type) {
    case OperationType.EXPENSE:
    case OperationType.INCOME:
      return (
        <Stack gap={3} className="rounded-lg bg-muted p-3">
          {accountField('Account')}
          {counterpartField('Category')}
          <AmountField control={control} name="amount" label="Amount" disabled={disabled} />
        </Stack>
      )

    case OperationType.TRANSFER: {
      // The "from" side is always rendered on top; swapping the direction moves the fields.
      const sides = [
        <div key="account">{accountField(out ? 'From' : 'To')}</div>,
        <div key="counterpart">{counterpartField(out ? 'To' : 'From')}</div>,
      ]
      const [top, bottom] = out ? sides : sides.reverse()
      return (
        <Stack gap={3} className="rounded-lg bg-muted p-3">
          {top}
          <DirectionSwap key="swap" control={control} disabled={disabled} />
          {bottom}
          <AmountField control={control} name="amount" label="Amount" disabled={disabled} />
        </Stack>
      )
    }

    case OperationType.EXCHANGE: {
      const sides = [
        <Stack key="account" gap={3} className="rounded-lg bg-muted p-3">
          {accountField(out ? 'From' : 'To')}
          <AmountField
            control={control}
            name="amount"
            label={out ? 'Amount From' : 'Amount To'}
            disabled={disabled}
          />
        </Stack>,
        <Stack key="counterpart" gap={3} className="rounded-lg bg-muted p-3">
          {counterpartField(out ? 'To' : 'From')}
          <AmountField
            control={control}
            name="counterAmount"
            label={out ? 'Amount To' : 'Amount From'}
            disabled={disabled}
          />
        </Stack>,
      ]
      const [top, bottom] = out ? sides : sides.reverse()
      return (
        <>
          {top}
          <DirectionSwap key="swap" control={control} disabled={disabled} />
          {bottom}
        </>
      )
    }
  }
}

function AccountField({
  control,
  name,
  label,
  accountType,
  accountUsages,
  disabled,
}: {
  control: Control<OperationFormState>
  name: 'account' | 'counterpart'
  label: string
  accountType: AccountType
  accountUsages: AccountUsage[]
  disabled: boolean
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          {!disabled && (
            <FrequentAccounts
              usages={accountUsages}
              accountType={accountType}
              onSelect={field.onChange}
            />
          )}
          <AccountInput
            id={field.name}
            type={accountType}
            value={field.value}
            onChange={field.onChange}
            disabled={disabled}
            aria-invalid={fieldState.invalid}
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}

function AmountField({
  control,
  name,
  label,
  disabled,
}: {
  control: Control<OperationFormState>
  name: 'amount' | 'counterAmount'
  label: string
  disabled: boolean
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <AmountInput
            id={field.name}
            value={field.value}
            onChange={field.onChange}
            disabled={disabled}
            aria-invalid={fieldState.invalid}
          />
          <FieldError errors={amountFieldErrors(fieldState.error)} />
        </Field>
      )}
    />
  )
}

function DirectionSwap({ control, disabled }: FormFieldProps) {
  return (
    <Controller
      name="direction"
      control={control}
      render={({ field }) => (
        <div className="flex justify-center">
          {disabled ? (
            <ArrowDownIcon className="size-4 text-muted-foreground" />
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Swap direction"
              onClick={() =>
                field.onChange(
                  field.value === OperationDirection.OUT
                    ? OperationDirection.IN
                    : OperationDirection.OUT,
                )
              }
            >
              <ArrowUpDownIcon className="text-muted-foreground" />
            </Button>
          )}
        </div>
      )}
    />
  )
}

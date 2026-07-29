'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { create } from 'zustand'
import { format } from 'date-fns'

import { accountUrls } from '@/api/account'
import { DateInput } from '@/components/common/input/date-input'
import { AccountTypeInput } from '@/components/common/input/account-type-input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { Stack } from '@/components/common/layout/stack'
import { useRequest } from '@/hooks/use-request'
import { useAccountBalanceStore, useAccountStore } from '@/store/account'
import { Account, AccountType } from '@/types/account'

interface AccountSheetState {
  open: boolean
  accountId?: string
  openSheet: (accountId?: string) => void
  closeSheet: () => void
}

const useAccountSheetStore = create<AccountSheetState>((set) => ({
  open: false,
  accountId: undefined,
  openSheet: (accountId) => set({ open: true, accountId }),
  closeSheet: () => set({ open: false }),
}))

export function openAccountSheet(accountId?: string) {
  useAccountSheetStore.getState().openSheet(accountId)
}

const accountFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  type: z.enum(AccountType),
  parser: z.string(),
  deleted: z.boolean(),
  reviseDate: z.date().optional(),
  externalId: z.string(),
})

type AccountFormState = z.infer<typeof accountFormSchema>

const accountFormResolver = zodResolver(accountFormSchema)

function createDefaultFormState(): AccountFormState {
  return {
    name: '',
    type: AccountType.ACCOUNT,
    parser: '',
    deleted: false,
    reviseDate: undefined,
    externalId: '',
  }
}

function accountToFormState(account: Account): AccountFormState {
  return {
    name: account.name,
    type: account.type,
    parser: account.parser ?? '',
    deleted: account.deleted,
    reviseDate: account.reviseDate ? new Date(account.reviseDate + 'T00:00:00') : undefined,
    externalId: account.externalId ?? '',
  }
}

export function AccountSheet() {
  const { open, accountId, closeSheet } = useAccountSheetStore()
  const accountStore = useAccountStore()
  const balanceStore = useAccountBalanceStore()
  const saveAccount = useRequest(accountUrls.root)

  const {
    control,
    handleSubmit,
    reset,
    watch,
  } = useForm<AccountFormState>({
    resolver: accountFormResolver,
    defaultValues: createDefaultFormState(),
  })

  const type = watch('type')

  useEffect(() => {
    if (open) {
      if (accountId) {
        accountStore.setPathParams({ id: accountId })
        void accountStore.fetch()
      } else {
        accountStore.reset()
        reset(createDefaultFormState())
      }
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const account = accountStore.data
    if (!account) return
    reset(accountToFormState(account))
  }, [accountStore.data]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: AccountFormState) => {
    await saveAccount.submit({
      body: {
        id: accountId,
        name: data.name,
        type: data.type,
        parser: data.parser || undefined,
        deleted: data.deleted,
        reviseDate: data.reviseDate ? format(data.reviseDate, 'yyyy-MM-dd') : undefined,
        externalId: data.type === AccountType.ACCOUNT ? data.externalId || undefined : undefined,
      },
    })
    void balanceStore.fetch()
    closeSheet()
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) closeSheet()
  }

  const loading = accountStore.loading

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{accountId ? 'Edit Account' : 'New Account'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="contents">
          {loading ? (
            <Stack align="center" justify="center" className="flex-1">
              <Spinner />
            </Stack>
          ) : (
            <Stack gap={4} scrollable className="px-4 flex-1">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input id={field.name} aria-invalid={fieldState.invalid} {...field} />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="type"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Type</FieldLabel>
                    <AccountTypeInput value={field.value} onChange={field.onChange} />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="parser"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Parser</FieldLabel>
                    <Input
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Not set"
                      {...field}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              {type === AccountType.ACCOUNT && (
                <Controller
                  name="externalId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>External ID</FieldLabel>
                      <Input
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="Not set"
                        {...field}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              )}

              <Controller
                name="reviseDate"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Revise Date</FieldLabel>
                    <DateInput
                      id={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      clearable
                      placeholder="Not set"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="deleted"
                control={control}
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id={field.name}
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                    <FieldLabel htmlFor={field.name}>Deleted</FieldLabel>
                  </Field>
                )}
              />
            </Stack>
          )}

          <SheetFooter>
            <Button type="submit" disabled={saveAccount.loading || loading}>
              Save
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

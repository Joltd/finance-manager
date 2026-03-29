'use client'

import { useEffect, useState } from 'react'
import { create } from 'zustand'

import { accountUrls } from '@/api/account'
import { DateInput } from '@/components/common/input/date-input'
import { AccountGroupInput } from '@/components/common/input/account-group-input'
import { AccountTypeInput } from '@/components/common/input/account-type-input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { Stack } from '@/components/common/layout/stack'
import { useRequest } from '@/hooks/use-request'
import { useAccountBalanceStore, useAccountStore } from '@/store/account'
import { AccountType } from '@/types/account'
import type { Reference } from '@/types/common/reference'
import { format } from 'date-fns'

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

type AccountFormState = {
  name: string
  type: AccountType
  group?: Reference
  parser: string
  deleted: boolean
  reviseDate?: Date
  externalId: string
}

const defaultFormState: AccountFormState = {
  name: '',
  type: AccountType.ACCOUNT,
  group: undefined,
  parser: '',
  deleted: false,
  reviseDate: undefined,
  externalId: '',
}

export function AccountSheet() {
  const { open, accountId, closeSheet } = useAccountSheetStore()
  const accountStore = useAccountStore()
  const balanceStore = useAccountBalanceStore()
  const saveAccount = useRequest(accountUrls.root)
  const [form, setForm] = useState<AccountFormState>(defaultFormState)

  useEffect(() => {
    if (open) {
      if (accountId) {
        accountStore.setPathParams({ id: accountId })
        void accountStore.fetch()
      } else {
        accountStore.reset()
        setForm(defaultFormState)
      }
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const account = accountStore.data
    if (!account) return
    setForm({
      name: account.name,
      type: account.type,
      group: account.group,
      parser: account.parser ?? '',
      deleted: account.deleted,
      reviseDate: account.reviseDate ? new Date(account.reviseDate) : undefined,
      externalId: account.externalId ?? '',
    })
  }, [accountStore.data])

  const handleSubmit = async () => {
    await saveAccount.submit({
      body: {
        id: accountId,
        name: form.name,
        type: form.type,
        group: form.group,
        parser: form.parser || undefined,
        deleted: form.deleted,
        reviseDate: form.reviseDate ? format(form.reviseDate, 'd MMM yyyy') : undefined,
        externalId: form.type === AccountType.ACCOUNT ? form.externalId || undefined : undefined,
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

        {loading ? (
          <Stack align="center" justify="center" className="flex-1">
            <Spinner />
          </Stack>
        ) : (
          <Stack gap={4} scrollable className="px-4 flex-1">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>

            <Field>
              <FieldLabel>Type</FieldLabel>
              <AccountTypeInput
                value={form.type}
                onChange={(type) => setForm((f) => ({ ...f, type }))}
              />
            </Field>

            <Field>
              <FieldLabel>Group</FieldLabel>
              <AccountGroupInput
                value={form.group}
                onChange={(group) => setForm((f) => ({ ...f, group }))}
                placeholder="No group"
              />
            </Field>

            <Field>
              <FieldLabel>Parser</FieldLabel>
              <Input
                value={form.parser}
                onChange={(e) => setForm((f) => ({ ...f, parser: e.target.value }))}
                placeholder="Not set"
              />
            </Field>

            {form.type === AccountType.ACCOUNT && (
              <Field>
                <FieldLabel>External ID</FieldLabel>
                <Input
                  value={form.externalId}
                  onChange={(e) => setForm((f) => ({ ...f, externalId: e.target.value }))}
                  placeholder="Not set"
                />
              </Field>
            )}

            <Field>
              <FieldLabel>Revise Date</FieldLabel>
              <DateInput
                value={form.reviseDate}
                onChange={(date) => setForm((f) => ({ ...f, reviseDate: date }))}
                clearable
                placeholder="Not set"
              />
            </Field>

            <Field orientation="horizontal">
              <Checkbox
                id="deleted"
                checked={form.deleted}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, deleted: checked === true }))}
              />
              <FieldLabel htmlFor="deleted">Deleted</FieldLabel>
            </Field>
          </Stack>
        )}

        <SheetFooter>
          <Button onClick={() => void handleSubmit()} disabled={saveAccount.loading || loading}>
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

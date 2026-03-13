'use client'

import { useEffect, useState } from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'

import { accountUrls } from '@/api/account'
import { DateInput } from '@/components/common/input/date-input'
import { ReferenceInput } from '@/components/common/input/reference-input'
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
import {
  useAccountBalanceStore,
  useAccountGroupReferenceStore,
  useAccountStore,
} from '@/store/account'
import type { AccountType } from '@/types/account'
import type { Reference } from '@/types/common/reference'

type AccountFormState = {
  name: string
  type: AccountType
  group?: Reference
  parser: string
  deleted: boolean
  reviseDate?: Date
}

const defaultFormState: AccountFormState = {
  name: '',
  type: 'ACCOUNT',
  group: undefined,
  parser: '',
  deleted: false,
  reviseDate: undefined,
}

interface AccountSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId?: string
}

export function AccountSheet({ open, onOpenChange, accountId }: AccountSheetProps) {
  const groupStore = useAccountGroupReferenceStore()
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
        reviseDate: form.reviseDate ? form.reviseDate.toISOString().split('T')[0] : undefined,
      },
    })
    void balanceStore.fetch()
    onOpenChange(false)
  }

  const loading = accountStore.loading

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{accountId ? 'Edit Account' : 'New Account'}</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-col gap-4 px-4 flex-1 overflow-y-auto">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>

            <Field>
              <FieldLabel>Type</FieldLabel>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v as AccountType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="ACCOUNT">Account</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Group</FieldLabel>
              <ReferenceInput<Reference>
                store={groupStore}
                value={form.group}
                onChange={(group) => setForm((f) => ({ ...f, group }))}
                getLabel={(g) => g.name}
                getId={(g) => g.id}
                placeholder="No group"
              />
            </Field>

            <Field>
              <FieldLabel>Parser</FieldLabel>
              <Input
                value={form.parser}
                onChange={(e) => setForm((f) => ({ ...f, parser: e.target.value }))}
              />
            </Field>

            <Field>
              <FieldLabel>Revise Date</FieldLabel>
              <DateInput
                value={form.reviseDate}
                onChange={(date) => setForm((f) => ({ ...f, reviseDate: date }))}
                placeholder="Not set"
              />
            </Field>

            <Field orientation="horizontal">
              <Checkbox.Root
                id="deleted"
                checked={form.deleted}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, deleted: checked === true }))}
                className="size-4 shrink-0 rounded-sm border border-input bg-transparent shadow-xs transition-colors data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <Checkbox.Indicator className="flex items-center justify-center text-primary-foreground">
                  <CheckIcon className="size-3" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <FieldLabel htmlFor="deleted">Deleted</FieldLabel>
            </Field>
          </div>
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

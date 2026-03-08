'use client'

import { useEffect, useState } from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'

import { accountUrls } from '@/api/account'
import { DateInput } from '@/components/common/input/date-input'
import { ReferenceInput } from '@/components/common/input/reference-input'
import { SelectInput, SelectInputOption } from '@/components/common/input/select-input'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useRequest } from '@/hooks/use-request'
import { useAccountGroupReferenceStore } from '@/store/account'
import type { Account, AccountType } from '@/types/account'
import type { Reference } from '@/types/common/reference'

type AccountFormState = {
  name: string
  type: AccountType
  group?: Reference
  parser: string
  deleted: boolean
  reviseDate?: Date
}

function toFormState(account?: Account): AccountFormState {
  return {
    name: account?.name ?? '',
    type: account?.type ?? 'ACCOUNT',
    group: account?.group?.id
      ? { id: account.group.id, name: account.group.name, deleted: account.group.deleted }
      : undefined,
    parser: account?.parser ?? '',
    deleted: account?.deleted ?? false,
    reviseDate: account?.reviseDate ? new Date(account.reviseDate) : undefined,
  }
}

interface AccountSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: Account
  onSaved: () => void
}

export function AccountSheet({ open, onOpenChange, account, onSaved }: AccountSheetProps) {
  const groupStore = useAccountGroupReferenceStore()
  const saveAccount = useRequest(accountUrls.root)
  const [form, setForm] = useState<AccountFormState>(() => toFormState(account))

  useEffect(() => {
    if (open) setForm(toFormState(account))
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    await saveAccount.submit({
      body: {
        id: account?.id,
        name: form.name,
        type: form.type,
        group: form.group,
        parser: form.parser || undefined,
        deleted: form.deleted,
        reviseDate: form.reviseDate ? form.reviseDate.toISOString().split('T')[0] : undefined,
      },
    })
    onSaved()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{account ? 'Edit Account' : 'New Account'}</SheetTitle>
        </SheetHeader>

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
            <SelectInput<AccountType>
              value={form.type}
              onChange={(type) => setForm((f) => ({ ...f, type }))}
            >
              <SelectInputOption<AccountType> id="ACCOUNT" label="Account" />
              <SelectInputOption<AccountType> id="EXPENSE" label="Expense" />
              <SelectInputOption<AccountType> id="INCOME" label="Income" />
            </SelectInput>
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

        <SheetFooter>
          <Button onClick={() => void handleSubmit()} disabled={saveAccount.loading}>
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

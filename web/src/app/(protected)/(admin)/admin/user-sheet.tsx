'use client'

import { useEffect, useState } from 'react'
import { create } from 'zustand'

import { userUrls } from '@/api/user'
import { Stack } from '@/components/common/layout/stack'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { useRequest } from '@/hooks/use-request'
import { useAdminUserListStore, useAdminUserStore } from '@/store/user'

interface UserSheetState {
  open: boolean
  userId?: string
  openSheet: (userId?: string) => void
  closeSheet: () => void
}

const useUserSheetStore = create<UserSheetState>((set) => ({
  open: false,
  userId: undefined,
  openSheet: (userId) => set({ open: true, userId }),
  closeSheet: () => set({ open: false }),
}))

export function openUserSheet(userId?: string) {
  useUserSheetStore.getState().openSheet(userId)
}

type UserFormState = {
  name: string
  login: string
  password: string
  deleted: boolean
}

const defaultFormState: UserFormState = {
  name: '',
  login: '',
  password: '',
  deleted: false,
}

export function UserSheet() {
  const { open, userId, closeSheet } = useUserSheetStore()
  const userStore = useAdminUserStore()
  const listStore = useAdminUserListStore()
  const saveUser = useRequest(userUrls.adminRoot)
  const [form, setForm] = useState<UserFormState>(defaultFormState)

  useEffect(() => {
    if (open) {
      if (userId) {
        userStore.setPathParams({ id: userId })
        void userStore.fetch()
      } else {
        userStore.reset()
        setForm(defaultFormState)
      }
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const user = userStore.data
    if (!user) return
    setForm({
      name: user.name,
      login: user.login,
      password: '',
      deleted: user.deleted,
    })
  }, [userStore.data])

  const handleSubmit = async () => {
    await saveUser.submit({
      body: {
        id: userId,
        name: form.name,
        login: form.login,
        password: form.password || undefined,
        deleted: form.deleted,
      },
    })
    void listStore.fetch()
    closeSheet()
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) closeSheet()
  }

  const loading = userStore.loading

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{userId ? 'Edit User' : 'New User'}</SheetTitle>
        </SheetHeader>

        {loading ? (
          <Stack align="center" justify="center" className="flex-1">
            <Spinner />
          </Stack>
        ) : (
          <Stack gap={4} className="px-4 flex-1 overflow-y-auto">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>

            <Field>
              <FieldLabel>Login</FieldLabel>
              <Input
                value={form.login}
                onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))}
              />
            </Field>

            <Field>
              <FieldLabel>{userId ? 'New Password' : 'Password'}</FieldLabel>
              <Input
                type="password"
                value={form.password}
                placeholder={userId ? 'Leave empty to keep current' : ''}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </Field>

            {userId && (
              <Field orientation="horizontal">
                <Checkbox
                  id="deleted"
                  checked={form.deleted}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, deleted: checked === true }))
                  }
                />
                <FieldLabel htmlFor="deleted">Deleted</FieldLabel>
              </Field>
            )}
          </Stack>
        )}

        <SheetFooter>
          <Button onClick={() => void handleSubmit()} disabled={saveUser.loading || loading}>
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
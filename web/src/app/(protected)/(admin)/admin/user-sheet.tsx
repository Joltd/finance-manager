'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { create } from 'zustand'

import { userUrls } from '@/api/user'
import { Stack } from '@/components/common/layout/stack'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { useRequest } from '@/hooks/use-request'
import { useAdminUserListStore, useAdminUserStore } from '@/store/user'
import { AdminUser } from '@/types/user'

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

const userFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  login: z.string().min(1, 'Required'),
  password: z.string(),
  deleted: z.boolean(),
  pricingFeature: z.boolean(),
})

type UserFormState = z.infer<typeof userFormSchema>

const userFormResolver = zodResolver(userFormSchema)

function createDefaultFormState(): UserFormState {
  return {
    name: '',
    login: '',
    password: '',
    deleted: false,
    pricingFeature: false,
  }
}

function userToFormState(user: AdminUser): UserFormState {
  return {
    name: user.name,
    login: user.login,
    password: '',
    deleted: user.deleted,
    pricingFeature: user.pricingFeature ?? false,
  }
}

export function UserSheet() {
  const { open, userId, closeSheet } = useUserSheetStore()
  const userStore = useAdminUserStore()
  const listStore = useAdminUserListStore()
  const saveUser = useRequest(userUrls.adminRoot)

  const { control, handleSubmit, reset } = useForm<UserFormState>({
    resolver: userFormResolver,
    defaultValues: createDefaultFormState(),
  })

  useEffect(() => {
    if (open) {
      if (userId) {
        userStore.setPathParams({ id: userId })
        void userStore.fetch()
      } else {
        userStore.reset()
        reset(createDefaultFormState())
      }
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const user = userStore.data
    if (!user) return
    reset(userToFormState(user))
  }, [userStore.data]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: UserFormState) => {
    await saveUser.submit({
      body: {
        id: userId,
        name: data.name,
        login: data.login,
        password: data.password || undefined,
        deleted: data.deleted,
        pricingFeature: data.pricingFeature,
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
                name="login"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Login</FieldLabel>
                    <Input id={field.name} aria-invalid={fieldState.invalid} {...field} />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {userId ? 'New Password' : 'Password'}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="password"
                      aria-invalid={fieldState.invalid}
                      placeholder={userId ? 'Leave empty to keep current' : ''}
                      {...field}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              {userId && (
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
              )}

              {userId && (
                <Controller
                  name="pricingFeature"
                  control={control}
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <Checkbox
                        id={field.name}
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                      <FieldLabel htmlFor={field.name}>Pricing feature</FieldLabel>
                    </Field>
                  )}
                />
              )}
            </Stack>
          )}

          <SheetFooter>
            <Button type="submit" disabled={saveUser.loading || loading}>
              Save
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

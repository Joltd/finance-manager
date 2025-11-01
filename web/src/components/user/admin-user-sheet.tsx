'use client'

import z from 'zod'
import { openStoreSlice, OpenStoreState } from '@/store/common/open'
import { useStoreSelect } from '@/hooks/use-store-select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useCallback } from 'react'
import { useRequest } from '@/hooks/use-request'
import { userUrls } from '@/api/user'
import { Spinner } from '@/components/ui/spinner'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { useAdminUserStore } from '@/store/user'
import { Checkbox } from '@/components/ui/checkbox'
import { createStore } from 'zustand'

interface AdminUserSheetStoreState extends OpenStoreState {
  id?: string
  openWith: (id?: string) => void
}

const adminUserSheetStore = createStore<AdminUserSheetStoreState>((set, get, store) => ({
  ...openStoreSlice(set, get, store),
  openWith: (id?: string) => set({ opened: true, id }),
  close: () => set({ opened: false, id: undefined }),
}))

export const useAdminUserSheetStore = <K extends keyof AdminUserSheetStoreState>(...fields: K[]) =>
  useStoreSelect<AdminUserSheetStoreState, K>(adminUserSheetStore, ...fields)

type AdminUserFormData = z.infer<typeof formSchema>

const formSchema = z.object({
  id: z.string().uuid().optional(),
  tenant: z.string().optional(),
  name: z.string().nonempty(),
  login: z.string().nonempty(),
  password: z.string().optional(),
  deleted: z.boolean(),
})

export function AdminUserSheet() {
  const adminUserStore = useAdminUserStore('data', 'fetch', 'dataFetched', 'setPathParams')
  const { opened, id, close } = useAdminUserSheetStore('opened', 'id', 'close')
  const request = useRequest(userUrls.adminUser)

  const form = useForm<AdminUserFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: undefined,
      tenant: '',
      name: '',
      login: '',
      password: '',
      deleted: false,
    },
  })

  const setData = useCallback((data: AdminUserFormData) => {
    form.setValue('id', data.id)
    form.setValue('tenant', data.tenant)
    form.setValue('name', data.name)
    form.setValue('login', data.login)
    form.setValue('password', '')
    form.setValue('deleted', data.deleted)
  }, [])

  useEffect(() => {
    if (id) {
      adminUserStore.setPathParams({ id })
      adminUserStore.fetch()
    }
  }, [id])

  useEffect(() => {
    if (adminUserStore.data) {
      setData(adminUserStore.data as any)
    }
  }, [adminUserStore.data])

  const onSubmit = (data: AdminUserFormData) => {
    request.submit(data).then(() => closeSheet())
  }

  const onOpenChange = (value: boolean) => {
    if (!value) {
      closeSheet()
    }
  }

  const closeSheet = () => {
    close()
    form.reset()
    request.reset()
  }

  return (
    <Sheet open={opened} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby="">
        <SheetHeader>
          <SheetTitle>User</SheetTitle>
        </SheetHeader>
        <form
          id="admin-user-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-4 overflow-auto"
        >
          <FieldSet disabled={(!!id && !adminUserStore.dataFetched) || request.loading}>
            {request.error && (
              <FieldDescription className="text-red-400">{request.error}</FieldDescription>
            )}
            <FieldGroup>
              <Controller
                name="tenant"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Tenant</FieldLabel>
                    <Input {...field} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Name</FieldLabel>
                    <Input {...field} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="login"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Login</FieldLabel>
                    <Input {...field} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Password</FieldLabel>
                    <Input {...field} type="password" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="deleted"
                control={form.control}
                render={({ field: { value, onChange, ...rest }, fieldState }) => (
                  <Field orientation="horizontal">
                    <Checkbox checked={!!value} onCheckedChange={onChange} {...rest} />
                    <FieldContent>
                      <FieldLabel>Deleted</FieldLabel>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
        </form>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="secondary">Cancel</Button>
          </SheetClose>
          <Button
            type="submit"
            form="admin-user-form"
            disabled={(!!id && !adminUserStore.dataFetched) || request.loading}
          >
            {request.loading && <Spinner />}
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

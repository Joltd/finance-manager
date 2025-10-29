'use client'
import z from 'zod'
import { createOpenStore, OpenStoreState } from '@/store/common/open'
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
import { useUserStore } from '@/store/user'
import { useEffect, useCallback } from 'react'
import { useRequest } from '@/hooks/use-request'
import { userUrls } from '@/api/user'
import { Spinner } from '@/components/ui/spinner'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'

const userSheetStore = createOpenStore()

export const useUserSheetStore = <K extends keyof OpenStoreState>(...fields: K[]) =>
  useStoreSelect<OpenStoreState, K>(userSheetStore, ...fields)

type UserFormData = z.infer<typeof formSchema>

const formSchema = z.object({
  id: z.string().uuid().optional(),
  login: z.string().readonly(),
  name: z.string(),
})

export function UserSheet() {
  const userRequest = useRequest(userUrls.user)
  const userStore = useUserStore('data', 'loading', 'error', 'fetch', 'dataFetched')
  const { opened, close } = useUserSheetStore('opened', 'close')

  const form = useForm<UserFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: undefined,
      login: '',
      name: '',
    },
  })

  const setData = useCallback((data: UserFormData) => {
    form.setValue('id', data.id)
    form.setValue('login', data.login)
    form.setValue('name', data.name)
  }, [])

  useEffect(() => {
    if (opened) {
      if (!userStore.dataFetched) {
        userStore.fetch()
      } else {
        setData(userStore.data as any)
      }
    }
  }, [opened])

  useEffect(() => {
    if (userStore.data) {
      setData(userStore.data as any)
    }
  }, [userStore.data])

  const onSubmit = (data: UserFormData) => {
    userRequest.submit(data).then(() => {
      userStore.fetch()
      closeSheet()
    })
  }

  const onOpenChange = (value: boolean) => {
    if (!value) {
      closeSheet()
    }
  }

  const closeSheet = () => {
    close()
    form.reset()
    userRequest.reset()
  }

  return (
    <Sheet open={opened} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby="">
        <SheetHeader>
          <SheetTitle>User profile</SheetTitle>
        </SheetHeader>
        <form id="user-form" onSubmit={form.handleSubmit(onSubmit)} className="p-4">
          <FieldSet>
            {userRequest.error && (
              <FieldDescription className="text-red-400">{userRequest.error}</FieldDescription>
            )}
            <FieldGroup>
              <Controller
                name="login"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Login</FieldLabel>
                    <Input disabled {...field} />
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
            </FieldGroup>
          </FieldSet>
        </form>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="secondary">Cancel</Button>
          </SheetClose>
          <Button type="submit" form="user-form" disabled={userRequest.loading}>
            {userRequest.loading && <Spinner />}
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

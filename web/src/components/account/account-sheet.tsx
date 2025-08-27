import z from 'zod'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '../ui/sheet'
import { createStore } from 'zustand'
import { AccountType } from '@/types/account'
import { openStoreSlice, OpenStoreState } from '@/store/common/open'
import { useStoreSelect } from '@/hooks/use-store-select'
import { useRequest } from '@/hooks/use-request'
import { accountUrls } from '@/api/account'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAccountStore } from '@/store/account'
import { useCallback, useEffect } from 'react'
import {
  Form,
  FormBody,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AccountGroupInput } from '@/components/account/account-group-input'
import { Checkbox } from '@/components/ui/checkbox'
import { DateInput } from '@/components/common/date-input'
import { referenceSchema } from '@/types/common/reference'

interface AccountSheetStoreState extends OpenStoreState {
  id?: string
  openWith: (id?: string) => void
}

const accountSheetStore = createStore<AccountSheetStoreState>((set, get, store) => ({
  ...openStoreSlice(set, get, store),
  openWith: (id?: string) => set({ opened: true, id }),
  close: () => set({ opened: false, id: undefined }),
}))

export const useAccountSheetStore = <K extends keyof AccountSheetStoreState>(...fields: K[]) =>
  useStoreSelect<AccountSheetStoreState, K>(accountSheetStore, ...fields)

type AccountFormData = z.infer<typeof formSchema>

const formSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  deleted: z.boolean(),
  group: referenceSchema.optional(),
  parser: z.string().optional(),
  reviseDate: z.string().date().optional(),
})

export function AccountSheet() {
  const accountRequest = useRequest(accountUrls.root)
  const accountStore = useAccountStore(
    'data',
    'loading',
    'error',
    'setPathParams',
    'fetch',
    'reset',
  )
  const { opened, id, close } = useAccountSheetStore('opened', 'setOpened', 'id', 'close')

  const form = useForm<AccountFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: undefined,
      name: '',
      deleted: false,
      group: undefined,
      parser: '',
      reviseDate: undefined,
    },
  })

  const setData = useCallback((data: AccountFormData) => {
    form.setValue('id', data.id)
    form.setValue('name', data.name)
    form.setValue('deleted', data.deleted)
    form.setValue('group', data.group)
    form.setValue('parser', data.parser)
    form.setValue('reviseDate', data.reviseDate)
  }, [])

  useEffect(() => {
    accountStore.setPathParams({ id })
    if (id) {
      accountStore.fetch()
    }
  }, [id])

  useEffect(() => {
    if (accountStore.data) {
      setData(accountStore.data as any)
    }
  }, [accountStore.data])

  const onSubmit = (data: AccountFormData) => {
    accountRequest
      .submit({
        ...data,
        type: AccountType.ACCOUNT,
      })
      .then(() => closeSheet())
  }

  const onOpenChange = (value: boolean) => {
    if (!value) {
      closeSheet()
    }
  }

  const closeSheet = () => {
    close()
    form.reset()
    accountRequest.reset()
    accountStore.reset()
  }

  return (
    <Sheet open={opened} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby="">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <SheetHeader>
              <SheetTitle>Account</SheetTitle>
            </SheetHeader>
            <FormBody error={accountStore.error || accountRequest.error} className="p-4 grow">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deleted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deleted</FormLabel>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                    <FormControl>
                      <AccountGroupInput {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parser</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="reviseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revise date</FormLabel>
                    <FormControl>
                      <DateInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormBody>

            <SheetFooter>
              <SheetClose asChild>
                <Button variant="secondary">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={accountStore.loading || accountRequest.loading}>
                Save
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

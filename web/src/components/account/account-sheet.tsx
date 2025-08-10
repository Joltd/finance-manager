import z from 'zod'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '../ui/sheet'
import { createStore } from 'zustand'
import { Account, AccountType } from '@/types/account'
import { openStoreSlice, OpenStoreState } from '@/store/common/open'
import { useStoreSelect } from '@/hooks/use-store-select'
import { useRequest } from '@/hooks/use-request'
import { accountUrls } from '@/api/account'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAccountStore } from '@/store/account'
import { useEffect } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { AccountGroupInput } from '@/components/account/account-group-input'
import { referenceSchema } from '@/types/common'

interface AccountSheetStoreState extends OpenStoreState {
  id?: string
  openWith: (id?: string) => void
}

const accountSheetStore = createStore<AccountSheetStoreState>((set, get, store) => ({
  ...openStoreSlice(set, get, store),
  openWith: (id?: string) => set({ opened: true, id }),
}))

export const useAccountSheetStore = <K extends keyof AccountSheetStoreState>(...fields: K[]) =>
  useStoreSelect<AccountSheetStoreState, K>(accountSheetStore, ...fields)

type AccountFormData = z.infer<typeof formSchema>

const formSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  group: referenceSchema.optional(),
  parser: z.string().optional(),
  // deleted: z.boolean(),
  // reviseDate: z.string().date().optional(),
  // noRevise: z.boolean(),
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
  const { opened, setOpened, id, close } = useAccountSheetStore(
    'opened',
    'setOpened',
    'id',
    'close',
  )

  const form = useForm<AccountFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      // deleted: false,
      // noRevise: true,
    },
  })

  useEffect(() => {
    if (id) {
      accountStore.setPathParams({ id })
      accountStore.fetch()
    }
  }, [id])

  useEffect(() => {
    if (accountStore.data) {
      form.reset(accountStore.data)
    }
  }, [accountStore.data])

  const onSubmit = (data: AccountFormData) => {
    accountRequest
      .submit({
        ...data,
        type: AccountType.ACCOUNT,
      })
      .then(() => close())
  }

  const onOpenChange = (value: boolean) => {
    setOpened(value)
    if (!value) {
      form.reset()
      accountRequest.reset()
      accountStore.reset()
    }
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

              {/*<FormField*/}
              {/*  name="deleted"*/}
              {/*  render={({ field }) => (*/}
              {/*    <FormItem>*/}
              {/*      <FormLabel>Deleted</FormLabel>*/}
              {/*      <FormControl>*/}
              {/*        <Checkbox />*/}
              {/*      </FormControl>*/}
              {/*      <FormMessage />*/}
              {/*    </FormItem>*/}
              {/*  )}*/}
              {/*/>*/}

              {/*<FormField*/}
              {/*  name="reviseDate"*/}
              {/*  render={({ field }) => (*/}
              {/*    <FormItem>*/}
              {/*      <FormLabel>Revise date</FormLabel>*/}
              {/*      <FormControl>*/}

              {/*      </FormControl>*/}
              {/*      <FormMessage />*/}
              {/*    </FormItem>*/}
              {/*  )}*/}
              {/*/>*/}

              {/*<FormField*/}
              {/*  name="noRevise"*/}
              {/*  render={({ field }) => (*/}
              {/*    <FormItem>*/}
              {/*      <FormLabel>No revise</FormLabel>*/}
              {/*      <FormControl>*/}
              {/*        <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked)} />*/}
              {/*      </FormControl>*/}
              {/*      <FormMessage />*/}
              {/*    </FormItem>*/}
              {/*  )}*/}
              {/*/>*/}
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

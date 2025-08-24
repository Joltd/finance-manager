'use client'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormBody, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import { accountReferenceShema, AccountType } from '@/types/account'
import { useSettingStore } from '@/store/setting'
import { useRequest } from '@/hooks/use-request'
import { settingUrls } from '@/api/setting'
import React, { useEffect } from 'react'
import { CurrencyInput } from '@/components/common/currency-input'
import { AccountInput } from '@/components/common/account-input'
import { Button } from '@/components/ui/button'
import { SettingsIcon } from 'lucide-react'

const formSchema = z.object({
  operationDefaultCurrency: z.string().optional(),
  operationDefaultAccount: accountReferenceShema.optional(),
  operationCashAccount: accountReferenceShema.optional(),
})

export function SettingDialog() {
  const setting = useSettingStore('data', 'fetch')
  const settingSave = useRequest(settingUrls.root)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operationDefaultCurrency: undefined,
      operationDefaultAccount: undefined,
      operationCashAccount: undefined,
    },
  })

  useEffect(() => {
    if (setting.data) {
      form.setValue('operationDefaultCurrency', setting.data.operationDefaultCurrency)
      form.setValue('operationDefaultAccount', setting.data.operationDefaultAccount)
      form.setValue('operationCashAccount', setting.data.operationCashAccount)
    }
  }, [setting.data])

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    settingSave.submit(data).then(() => {
      setting.fetch()
      closeDialog()
    })
  }

  const onOpenChange = (value: boolean) => {
    if (!value) {
      closeDialog()
    }
  }

  const closeDialog = () => {
    form.reset()
    settingSave.reset()
  }

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <SettingsIcon />
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <FormBody className="py-4">
              <FormField
                control={form.control}
                name="operationDefaultCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default currency</FormLabel>
                    <FormControl>
                      <CurrencyInput {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operationDefaultAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default account</FormLabel>
                    <FormControl>
                      <AccountInput type={AccountType.ACCOUNT} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operationCashAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default cash account</FormLabel>
                    <FormControl>
                      <AccountInput type={AccountType.ACCOUNT} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div>Version {setting.data?.version}</div>
            </FormBody>
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormBody, FormControl, FormField, FormItem } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { useStoreSelect } from '@/hooks/use-store-select'
import { AskDialogStoreState, createAskDialogStore } from '@/store/common/ask-dialog'
import { useEffect } from 'react'

export interface AskTextDialogConfig {
  label: string
  value?: string
}

const askTextDialogStore = createAskDialogStore<AskTextDialogConfig, string>()

const useAskTextDialogStore = <K extends keyof AskDialogStoreState<AskTextDialogConfig, string>>(
  ...fields: K[]
) =>
  useStoreSelect<AskDialogStoreState<AskTextDialogConfig, string>, K>(askTextDialogStore, ...fields)

const formSchema = z.object({
  value: z.string(),
})

export function AskTextDialog() {
  const { config, opened, close, resolve } = useAskTextDialogStore(
    'config',
    'opened',
    'close',
    'resolve',
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
    },
  })

  useEffect(() => {
    form.setValue('value', config?.value || '')
  }, [config])

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    close()
    resolve(data.value)
  }

  const onOpenChange = (opened: boolean) => {
    if (!opened) {
      close()
      form.reset()
    }
  }

  return (
    <Dialog open={opened} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {config?.label && (
              <DialogHeader>
                <DialogTitle>{config.label}</DialogTitle>
              </DialogHeader>
            )}
            <FormBody className="py-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FormBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Ok</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export const askText = (label: string, value?: string): Promise<string> =>
  new Promise<string>((resolve) => {
    askTextDialogStore.getState().ask(resolve, { label, value })
  })

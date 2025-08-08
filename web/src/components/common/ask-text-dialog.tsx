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

const askTextDialogStore = createAskDialogStore<string, string>()

const useAskTextDialogStore = <K extends keyof AskDialogStoreState<string, string>>(
  ...fields: K[]
) => useStoreSelect<AskDialogStoreState<string, string>, K>(askTextDialogStore, ...fields)

const formSchema = z.object({
  value: z.string(),
})

export function AskTextDialog() {
  const {
    config: label,
    opened,
    close,
    resolve,
  } = useAskTextDialogStore('config', 'opened', 'close', 'resolve')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
    },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    close()
    form.reset()
    resolve(data.value)
  }

  const handleOpenChange = (opened: boolean) => {
    if (!opened) {
      close()
      form.reset()
    }
  }

  return (
    <Dialog open={opened} onOpenChange={handleOpenChange}>
      <DialogContent aria-describedby="">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {label && (
              <DialogHeader>
                <DialogTitle>{label}</DialogTitle>
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

export const askText = (label: string): Promise<string> =>
  new Promise<string>((resolve) => {
    askTextDialogStore.getState().ask(resolve, label)
  })

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { Form, FormBody, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { z } from 'zod'
import { useImportDataListStore } from '@/store/import-data'
import { zodResolver } from '@hookform/resolvers/zod'
import { importDataUrls } from '@/api/import-data'
import { useRequest } from '@/hooks/use-request'
import { jsonAsBlob } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { AccountInput } from '@/components/common/account-input'
import { accountReferenceShema, AccountType } from '@/types/account'
import { createOpenStore, OpenStoreState } from '@/store/common/open'
import { useStoreSelect } from '@/hooks/use-store-select'

const formSchema = z.object({
  account: accountReferenceShema,
  file: z
    .any()
    .refine((file) => file instanceof FileList && file.length > 0, { message: 'Field required' }),
})

const importDataNewDialogStore = createOpenStore()

export const useImportDataNewDialogStore = <K extends keyof OpenStoreState>(...fields: K[]) =>
  useStoreSelect<OpenStoreState, K>(importDataNewDialogStore, ...fields)

export function ImportDataNewDialog() {
  const { opened, setOpened, close } = useImportDataNewDialogStore('opened', 'setOpened', 'close')
  const importDataList = useImportDataListStore('fetch')
  const { loading, submit, reset } = useRequest(importDataUrls.begin, { multipart: true })
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const formData = new FormData()
    formData.append('data', jsonAsBlob({ account: data.account.id }))
    formData.append('file', data.file[0])
    submit(formData).then((result) => {
      form.reset()
      reset()
      close()
      router.push(`/import-data/${result}`)
      importDataList.fetch()
    })
  }

  const handleOpenChange = (opened: boolean) => {
    if (!opened) {
      form.reset()
      reset()
    }
    setOpened(opened)
  }

  return (
    <Dialog open={opened} onOpenChange={handleOpenChange}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>New import</DialogTitle>
            </DialogHeader>
            <FormBody className="py-4">
              <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account</FormLabel>
                    <FormControl>
                      <AccountInput type={AccountType.ACCOUNT} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File</FormLabel>
                    <FormControl>
                      <Input type="file" onChange={(e) => field.onChange(e.target.files)} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FormBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                Begin
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

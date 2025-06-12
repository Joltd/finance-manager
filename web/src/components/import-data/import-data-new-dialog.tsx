import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useImportDataStore } from "@/store/import-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { importDataUrls } from "@/api/import-data";
import { useRequest } from "@/hooks/use-request";
import { jsonAsBlob } from "@/lib/utils";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  account: z.string().uuid('Field required'),
  file: z.any().refine((file) => file instanceof FileList && file.length > 0, { message: 'Field required' })
})

export function ImportDataNewDialog() {
  const { importDataList, accountList, newDialogOpened, setNewDialogOpened } = useImportDataStore()
  const { loading, error, submit, reset } = useRequest(importDataUrls.begin, { multipart: true })
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account: ""
    }
  })

  useEffect(() => {
    if (newDialogOpened) {
      accountList.fetch()
    }
  }, [newDialogOpened]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const formData = new FormData()
    formData.append("data", jsonAsBlob({ account: data.account }))
    formData.append("file", data.file[0])
    submit(formData)
      .then((result) => {
        setNewDialogOpened(false)
        router.push(`/import-data/${result}`)
        importDataList.fetch()
      })
  }

  const handleOpenChange = (opened: boolean) => {
    if (!opened) {
      form.reset()
      reset()
    }
    setNewDialogOpened(opened)
  }

  return (
    <Dialog open={newDialogOpened} onOpenChange={handleOpenChange}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                New import
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && <div className="text-red-400">{error}</div>}
              <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accountList.data?.map((it) => (
                            <SelectItem key={it.id} value={it.id}>
                              {it.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
            </div>
            <DialogFooter>
              <DialogClose>Cancel</DialogClose>
              <Button type="submit" disabled={loading}>Begin</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
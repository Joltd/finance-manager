import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormBody, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRequest } from "@/hooks/use-request";
import { accountUrls } from "@/api/account";
import { useAccountStore } from "@/store/account";

const formSchema = z.object({
  name: z.string(),
})

export function AccountGroupNewDialog() {
  const { groupList, newGroupDialog } = useAccountStore()
  const { loading, error, submit, reset } = useRequest(accountUrls.group)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ""
    }
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    submit(data)
      .then(() => {
        newGroupDialog.setOpened(false)
        groupList.fetch()
      })
  }

  const handleOpenChange = (opened: boolean) => {
    if (!opened) {
      form.reset()
      reset()
    }
    newGroupDialog.setOpened(opened)
  }

  return (
    <Dialog open={newGroupDialog.opened} onOpenChange={handleOpenChange}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                Account group
              </DialogTitle>
            </DialogHeader>
            <FormBody error={error}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FormBody>
            <DialogFooter>
              <DialogClose>Cancel</DialogClose>
              <Button type="submit" disabled={loading}>Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
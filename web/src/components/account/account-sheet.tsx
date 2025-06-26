import z from "zod";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "../ui/sheet";
import { useRequest } from "@/hooks/use-request";
import { accountUrls } from "@/api/account";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormBody, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useAccountStore } from "@/store/account";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AccountGroupSelect } from "@/components/account/account-group-select";
import { ReferenceSelect } from "@/components/common/reference-select";

const formSchema = z.object({
  name: z.string(),
  group: z.object({
    id: z.string().uuid().optional(),
    name: z.string(),
  }).optional(),
  parser: z.string().optional(),
  deleted: z.boolean(),
  // reviseDate: z.string().date().optional(),
  // noRevise: z.boolean(),
})

export function AccountSheet() {
  const { groupList, accountSheet } = useAccountStore()
  const { loading, error, submit, reset } = useRequest(accountUrls.root)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      deleted: false,
      // noRevise: true,
    }
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // submit(data)
    //   .then((result) => {
    //
    //   })
    console.log('onSubmit', data)
  }

  return (
    <Sheet open={accountSheet.opened} onOpenChange={accountSheet.setOpened}>
      <SheetContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <SheetHeader>
              <SheetTitle>Account</SheetTitle>
            </SheetHeader>
            <FormBody error={error} className="p-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                    <FormControl>
                      <ReferenceSelect store={groupList} value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="deleted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deleted</FormLabel>
                    <FormControl>
                      <Checkbox />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
              <SheetClose>Cancel</SheetClose>
              <Button type="submit" disabled={loading}>Save</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
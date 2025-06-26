import { Sheet, SheetClose, SheetContent, SheetFooter, SheetTitle } from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { Form, FormBody, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OperationType } from "@/types/operation";
import { amountShema, referenceSchema } from "@/types/common";
import { format } from "date-fns";
import { useAccountStore } from "@/store/account";
import { useRequest } from "@/hooks/use-request";
import { operationUrls } from "@/api/operation";
import { ReferenceSelect } from "@/components/common/reference-select";
import { AmountInput } from "@/components/common/amount-input";
import { DateInput } from "@/components/common/date-input";
import { useEffect } from "react";
import { useOperationStore } from "@/store/operation";

export interface OperationSheetProps {

}

const formSchema = z.object({
  type: z.nativeEnum(OperationType),
  date: z.string().date().optional(),
  accountFrom: referenceSchema,
  amountFrom: amountShema,
  accountTo: referenceSchema,
  amountTo: amountShema,
  description: z.string().optional(),
})

export function OperationSheet() {
  const { accountList } = useAccountStore()
  const { operationSheet } = useOperationStore()
  const { loading, error, submit, reset } = useRequest(operationUrls.root)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: OperationType.EXCHANGE,
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
    }
  })
  const typeValue = form.watch('type')
  const amountToValue = form.watch('amountTo')

  useEffect(() => {
    if (typeValue !== OperationType.EXCHANGE) {
      form.setValue('amountFrom', amountToValue)
    }
  }, [amountToValue]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // submit(data)
    //   .then(() => {
    //
    //   })
    console.log(data)
  }

  return (
    <Sheet open={operationSheet.opened} onOpenChange={operationSheet.setOpened}>
      <SheetContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <SheetTitle>
              Operation
            </SheetTitle>
            <FormBody error={error}>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={OperationType.EXCHANGE}>Exchange</SelectItem>
                          <SelectItem value={OperationType.TRANSFER}>Transfer</SelectItem>
                          <SelectItem value={OperationType.EXPENSE}>Expense</SelectItem>
                          <SelectItem value={OperationType.INCOME}>Income</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <DateInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <FormControl>
                      <ReferenceSelect store={accountList} value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {typeValue === OperationType.EXCHANGE && (
                <FormField
                  control={form.control}
                  name="amountFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <AmountInput amount={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="accountTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <ReferenceSelect store={accountList} value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amountTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <AmountInput amount={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
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

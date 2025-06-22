import { Sheet, SheetClose, SheetContent, SheetFooter, SheetTitle } from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OperationType } from "@/types/operation";

export interface OperationSheetProps {

}

const formSchema = z.object({
  type: ,
  date: z.date(),
  accountFrom: ,
  amountFrom: ,
  accountTo: ,
  amountTo: ,
  description: z.string().optional(),
})

export function OperationSheet() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {

    }
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {

  }

  return (
    <Sheet>
      <SheetContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <SheetTitle>
              Operation
            </SheetTitle>
            <div>

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

            </div>
            <SheetFooter>
              <SheetClose>Cancel</SheetClose>
              <Button type="submit">Save</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

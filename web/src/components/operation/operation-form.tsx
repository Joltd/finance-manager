import { FormBody, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { z } from 'zod'
import { OperationType } from '@/types/operation'
import { accountReferenceShema, AccountType } from '@/types/account'
import { amountShema } from '@/types/common'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateInput } from '@/components/common/date-input'
import { AccountInput } from '@/components/common/account-input'
import { AmountInput } from '@/components/common/amount-input'
import React, { useEffect } from 'react'
import { Input } from '@/components/ui/input'

export interface OperationFormProps {
  form: UseFormReturn<OperationFormData>
  error?: string
  ref?: any
  className?: string
}

export type OperationFormData = z.infer<typeof formSchema>

const formSchema = z.object({
  type: z.nativeEnum(OperationType),
  date: z.string().date().optional(),
  accountFrom: accountReferenceShema,
  amountFrom: amountShema,
  accountTo: accountReferenceShema,
  amountTo: amountShema,
  description: z.string().optional(),
})

export const useOperationForm = () => {
  const form = useForm<OperationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: OperationType.EXCHANGE,
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
    },
  })

  useEffect(() => {
    const unsubscribe = form.subscribe({
      name: ['type', 'amountTo'],
      formState: {
        values: true,
      },
      callback: ({ values }) => {
        if (values.type === OperationType.EXPENSE) {
          if (values.accountFrom?.type !== AccountType.ACCOUNT) {
            form.resetField('accountFrom')
          }
          if (values.accountTo?.type !== AccountType.EXPENSE) {
            form.resetField('accountTo')
          }
        }

        if (values.type === OperationType.INCOME) {
          if (values.accountFrom?.type !== AccountType.INCOME) {
            form.resetField('accountFrom')
          }
          if (values.accountTo?.type !== AccountType.ACCOUNT) {
            form.resetField('accountTo')
          }
        }

        if (values.type !== OperationType.EXCHANGE) {
          form.setValue('amountFrom', values.amountTo)
        }
      },
    })

    return () => unsubscribe()
  }, [form])

  return {
    form,
  }
}

export function OperationForm({ form, error, ref, className }: OperationFormProps) {
  const type = form.watch('type')
  const accountFromType = type === OperationType.INCOME ? AccountType.INCOME : AccountType.ACCOUNT
  const accountToType = type === OperationType.EXPENSE ? AccountType.EXPENSE : AccountType.ACCOUNT

  return (
    <FormBody error={error} className={className}>
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
            <FormLabel>{type === OperationType.INCOME ? 'Income' : 'From'}</FormLabel>
            <FormControl>
              <AccountInput type={accountFromType} value={field.value} onChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      {type === OperationType.EXCHANGE && (
        <FormField
          control={form.control}
          name="amountFrom"
          render={({ field }) => (
            <FormItem>
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
            <FormLabel>{type === OperationType.EXPENSE ? 'Expense' : 'To'}</FormLabel>
            <FormControl>
              <AccountInput type={accountToType} value={field.value} onChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="amountTo"
        render={({ field }) => (
          <FormItem>
            {type !== OperationType.EXCHANGE && <FormLabel>Amount</FormLabel>}
            <FormControl>
              <AmountInput amount={field.value} onChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </FormBody>
  )
}

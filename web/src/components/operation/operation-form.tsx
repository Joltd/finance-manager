import { FormBody, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { z } from 'zod'
import { OperationType } from '@/types/operation'
import { accountReferenceShema, AccountType } from '@/types/account'
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
import React, { useCallback, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { EmbeddingLabel } from '@/components/common/embedding-label'
import { amountShema } from '@/types/common/amount'
import { embeddingSchema } from '@/types/common/embedding'

export interface OperationFormProps {
  form: UseFormReturn<OperationFormData>
  error?: string
  className?: string
}

export type OperationFormData = z.infer<typeof formSchema>

const formSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.nativeEnum(OperationType),
  date: z.string().date(),
  accountFrom: accountReferenceShema,
  amountFrom: amountShema,
  accountTo: accountReferenceShema,
  amountTo: amountShema,
  description: z.string(),
  raw: z.array(z.string()),
  hint: embeddingSchema.optional(),
})

export const useOperationForm = () => {
  const form = useForm<OperationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: undefined,
      type: OperationType.EXCHANGE,
      date: format(new Date(), 'yyyy-MM-dd'),
      accountFrom: undefined,
      amountFrom: undefined,
      accountTo: undefined,
      amountTo: undefined,
      description: '',
      raw: [],
      hint: undefined,
    },
  })

  const clear = useCallback(() => form.reset(), [])

  const setData = useCallback((data: OperationFormData) => {
    form.setValue('id', data.id)
    form.setValue('type', data.type)
    form.setValue('date', data.date)
    form.setValue('accountFrom', data.accountFrom)
    form.setValue('amountFrom', data.amountFrom)
    form.setValue('accountTo', data.accountTo)
    form.setValue('amountTo', data.amountTo)
    form.setValue('description', data.description)
    form.setValue('raw', data.raw)
    form.setValue('hint', data.hint)
  }, [])

  const type = form.watch('type')
  const amountTo = form.watch('amountTo')

  useEffect(() => {
    if (type === OperationType.EXPENSE) {
      if (form.getValues().accountFrom?.type !== AccountType.ACCOUNT) {
        form.resetField('accountFrom')
      }
      if (form.getValues().accountTo?.type !== AccountType.EXPENSE) {
        form.resetField('accountTo')
      }
    }

    if (type === OperationType.INCOME) {
      if (form.getValues().accountFrom?.type !== AccountType.INCOME) {
        form.resetField('accountFrom')
      }
      if (form.getValues().accountTo?.type !== AccountType.ACCOUNT) {
        form.resetField('accountTo')
      }
    }
  }, [type])

  useEffect(() => {
    if (form.getValues().type !== OperationType.EXCHANGE) {
      form.setValue('amountFrom', amountTo)
    }
  }, [amountTo])

  return {
    form,
    setData,
    clear,
  }
}

export function OperationForm({ form, error, className }: OperationFormProps) {
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
              <Input {...field} value={field.value || ''} />
            </FormControl>
          </FormItem>
        )}
      />

      {!!form.getValues().raw?.length && (
        <FormField
          control={form.control}
          name="raw"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Raw</FormLabel>
              <FormControl>
                <Textarea
                  readOnly
                  value={field.value?.join('\n') || ''}
                  className="whitespace-pre max-h-40"
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      {!!form.getValues().hint && (
        <FormField
          control={form.control}
          name="hint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hint</FormLabel>
              <FormControl>
                <EmbeddingLabel embedding={field.value} />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </FormBody>
  )
}

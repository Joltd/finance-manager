'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeftIcon } from 'lucide-react'

import { pricingItemUrls } from '@/api/pricing-item'
import { TextSuggestInput } from '@/components/common/input/text-suggest-input'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Stack } from '@/components/common/layout/stack'
import { Typography } from '@/components/common/typography/typography'
import { useRequest } from '@/hooks/use-request'
import { PricingItem } from '@/types/pricing-item'

const itemFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  category: z.string().min(1, 'Required'),
  unit: z.string().min(1, 'Required'),
  defaultQuantity: z.string().min(1, 'Required'),
})

type ItemFormState = z.infer<typeof itemFormSchema>

const itemFormResolver = zodResolver(itemFormSchema)

interface ItemCreateStepProps {
  initialName: string
  onCreated: (item: PricingItem) => void
  onBack: () => void
}

export function ItemCreateStep({ initialName, onCreated, onBack }: ItemCreateStepProps) {
  const saveItem = useRequest<PricingItem>(pricingItemUrls.root)

  const { control, handleSubmit } = useForm<ItemFormState>({
    resolver: itemFormResolver,
    defaultValues: {
      name: initialName,
      category: '',
      unit: '',
      defaultQuantity: '1',
    },
  })

  const onSubmit = async (data: ItemFormState) => {
    const created = await saveItem.submit({
      body: {
        name: data.name,
        category: data.category,
        unit: data.unit,
        defaultQuantity: Number(data.defaultQuantity.replace(',', '.')),
      },
    })
    onCreated(created)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={4}>
        <Stack orientation="horizontal" align="center" gap={2}>
          <Button type="button" variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeftIcon />
          </Button>
          <Typography variant="h3">New item</Typography>
        </Stack>

        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <Input id={field.name} aria-invalid={fieldState.invalid} autoFocus {...field} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="category"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Category</FieldLabel>
              <TextSuggestInput
                id={field.name}
                url={pricingItemUrls.categoryReference}
                value={field.value}
                onChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="unit"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Unit</FieldLabel>
              <TextSuggestInput
                id={field.name}
                url={pricingItemUrls.unitReference}
                value={field.value}
                onChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="defaultQuantity"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Default Quantity</FieldLabel>
              <Input id={field.name} aria-invalid={fieldState.invalid} inputMode="decimal" {...field} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Button type="submit" size="lg" disabled={saveItem.loading}>
          Continue
        </Button>
      </Stack>
    </form>
  )
}

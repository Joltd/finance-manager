'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeftIcon } from 'lucide-react'

import { AmountInput } from '@/components/common/input/amount-input'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Stack } from '@/components/common/layout/stack'
import { Typography } from '@/components/common/typography/typography'
import { amountSchema, Amount } from '@/types/common/amount'
import { PricingItem } from '@/types/pricing-item'

function amountFieldErrors(error?: { message?: string; currency?: { message?: string } }) {
  return [error, error?.currency].filter((e): e is { message?: string } => Boolean(e?.message))
}

const priceQuantityFormSchema = z
  .object({
    price: amountSchema.optional(),
    quantity: z.string().min(1, 'Required'),
  })
  .superRefine((data, ctx) => {
    if (!data.price) {
      ctx.addIssue({ code: 'custom', path: ['price'], message: 'Required' })
    }
  })

type PriceQuantityFormState = z.infer<typeof priceQuantityFormSchema>

const priceQuantityFormResolver = zodResolver(priceQuantityFormSchema)

interface PriceQuantityStepProps {
  item: PricingItem
  defaultCurrency?: string
  canSaveNow: boolean
  saving: boolean
  onNext: (price: Amount, quantity: number) => void
  onSaveNow: (price: Amount, quantity: number) => void
  onBack: () => void
}

export function PriceQuantityStep({
  item,
  defaultCurrency,
  canSaveNow,
  saving,
  onNext,
  onSaveNow,
  onBack,
}: PriceQuantityStepProps) {
  const { control, handleSubmit } = useForm<PriceQuantityFormState>({
    resolver: priceQuantityFormResolver,
    defaultValues: {
      price: defaultCurrency ? { value: 0, currency: defaultCurrency } : undefined,
      quantity: String(item.defaultQuantity),
    },
  })

  const toWire = (data: PriceQuantityFormState) =>
    [data.price!, Number(data.quantity.replace(',', '.'))] as const

  const handleNext = handleSubmit((data) => {
    const [price, quantity] = toWire(data)
    onNext(price, quantity)
  })

  const handleSaveNow = handleSubmit((data) => {
    const [price, quantity] = toWire(data)
    onSaveNow(price, quantity)
  })

  return (
    <form onSubmit={handleNext}>
      <Stack gap={4}>
        <Stack orientation="horizontal" align="center" gap={2}>
          <Button type="button" variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeftIcon />
          </Button>
          <Typography variant="h3">{item.name}</Typography>
        </Stack>

        <Controller
          name="price"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Price</FieldLabel>
              <AmountInput
                id={field.name}
                value={field.value}
                onChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={amountFieldErrors(fieldState.error)} />
            </Field>
          )}
        />

        <Controller
          name="quantity"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Quantity
                {item.unit && <span className="text-muted-foreground font-normal">({item.unit})</span>}
              </FieldLabel>
              <Input
                id={field.name}
                aria-invalid={fieldState.invalid}
                inputMode="decimal"
                autoFocus
                className="h-11 text-base"
                {...field}
                onFocus={(e) => e.target.select()}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Stack gap={2}>
          <Button type="submit" size="lg" variant="outline" disabled={saving}>
            Next
          </Button>
          <Button type="button" size="lg" disabled={saving || !canSaveNow} onClick={handleSaveNow}>
            Save
          </Button>
        </Stack>
      </Stack>
    </form>
  )
}

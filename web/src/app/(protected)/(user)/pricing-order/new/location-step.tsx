'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeftIcon } from 'lucide-react'

import { pricingOrderUrls } from '@/api/pricing-order'
import { DateInput } from '@/components/common/input/date-input'
import { TextSuggestInput } from '@/components/common/input/text-suggest-input'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Stack } from '@/components/common/layout/stack'
import { Typography } from '@/components/common/typography/typography'

const locationFormSchema = z.object({
  date: z.date(),
  country: z.string().min(1, 'Required'),
  city: z.string().min(1, 'Required'),
  store: z.string().min(1, 'Required'),
  comment: z.string(),
})

type LocationFormState = z.infer<typeof locationFormSchema>

const locationFormResolver = zodResolver(locationFormSchema)

export interface LocationValues {
  date: Date
  country: string
  city: string
  store: string
  comment: string
}

interface LocationStepProps {
  initial: LocationValues
  saving: boolean
  onSave: (values: LocationValues) => void
  onBack: () => void
}

export function LocationStep({ initial, saving, onSave, onBack }: LocationStepProps) {
  const { control, handleSubmit } = useForm<LocationFormState>({
    resolver: locationFormResolver,
    defaultValues: initial,
  })

  const onSubmit = (data: LocationFormState) => {
    onSave(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={4}>
        <Stack orientation="horizontal" align="center" gap={2}>
          <Button type="button" variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeftIcon />
          </Button>
          <Typography variant="h3">Details</Typography>
        </Stack>

        <Controller
          name="date"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Date</FieldLabel>
              <DateInput
                id={field.name}
                value={field.value}
                onChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="country"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Country</FieldLabel>
              <TextSuggestInput
                id={field.name}
                url={pricingOrderUrls.countryReference}
                value={field.value}
                onChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="city"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>City</FieldLabel>
              <TextSuggestInput
                id={field.name}
                url={pricingOrderUrls.cityReference}
                value={field.value}
                onChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="store"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Store</FieldLabel>
              <TextSuggestInput
                id={field.name}
                url={pricingOrderUrls.storeReference}
                value={field.value}
                onChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="comment"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Comment</FieldLabel>
              <Input id={field.name} aria-invalid={fieldState.invalid} placeholder="Not set" {...field} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Button type="submit" size="lg" disabled={saving}>
          Save
        </Button>
      </Stack>
    </form>
  )
}

'use client'

import React, { useEffect } from 'react'
import { Control, Controller, useFieldArray, useForm } from 'react-hook-form'
import { PlusIcon, Trash2Icon } from 'lucide-react'

import { usePricingComparisonReportStore } from '@/store/report'
import { PricingComparisonReport } from '@/types/report'
import { pricingOrderUrls } from '@/api/pricing-order'
import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { Group } from '@/components/common/layout/group'
import { Typography } from '@/components/common/typography/typography'
import { DateInput } from '@/components/common/input/date-input'
import { TextSuggestInput } from '@/components/common/input/text-suggest-input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import {
  createDefaultFormState,
  createEmptySlice,
  MAX_SLICES,
  PricingComparisonFormState,
  pricingComparisonFormResolver,
  toPricingComparisonFilter,
} from './pricing-comparison-form'
import { PricingComparisonTable } from './pricing-comparison-table'

export default function PricingComparisonPage() {
  const { data, loading, error, fetch, setBody, reset } = usePricingComparisonReportStore()

  const { control, handleSubmit } = useForm<PricingComparisonFormState>({
    resolver: pricingComparisonFormResolver,
    defaultValues: createDefaultFormState(),
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'slices' })

  // the store is global, so a result from a previous visit must not be shown for a fresh form
  useEffect(() => {
    reset()
  }, [reset])

  const onSubmit = async (form: PricingComparisonFormState) => {
    setBody(toPricingComparisonFilter(form))
    try {
      await fetch()
    } catch {
      // the error is kept in the store and rendered below
    }
  }

  const canAdd = fields.length < MAX_SLICES

  return (
    <Layout scrollable>
      <Stack orientation="horizontal" align="center" justify="between" className="shrink-0">
        <Typography variant="h3">Pricing Comparison</Typography>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack gap={4}>
          <Group
            title="Slices"
            endContent={
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!canAdd}
                title={canAdd ? undefined : `No more than ${MAX_SLICES} slices`}
                onClick={() => append(createEmptySlice())}
              >
                <PlusIcon />
                Add
              </Button>
            }
          >
            {fields.length === 0 ? (
              <Typography variant="muted" className="py-4">
                Add a slice to compare prices
              </Typography>
            ) : (
              <Stack gap={0}>
                {fields.map((field, index) => (
                  <SliceRow
                    key={field.id}
                    index={index}
                    control={control}
                    onRemove={() => remove(index)}
                  />
                ))}
              </Stack>
            )}
          </Group>

          <div>
            <Button type="submit" disabled={fields.length === 0 || loading}>
              {loading && <Spinner className="size-4" />}
              Generate report
            </Button>
          </div>
        </Stack>
      </form>

      <ReportResult loading={loading} error={error} data={data} />
    </Layout>
  )
}

interface SliceRowProps {
  index: number
  control: Control<PricingComparisonFormState>
  onRemove: () => void
}

function SliceRow({ index, control, onRemove }: SliceRowProps) {
  return (
    <Stack gap={2} className="border-b py-3 last:border-b-0">
      <Stack orientation="horizontal" align="center" gap={2}>
        <Typography as="span" variant="small">
          Slice {index + 1}
        </Typography>
        {index === 0 && <Badge variant="secondary">Base</Badge>}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ml-auto size-7 text-destructive hover:text-destructive"
          title="Remove slice"
          onClick={onRemove}
        >
          <Trash2Icon className="size-4" />
        </Button>
      </Stack>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Controller
          name={`slices.${index}.from`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>From</FieldLabel>
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
          name={`slices.${index}.to`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>To</FieldLabel>
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
          name={`slices.${index}.country`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Country</FieldLabel>
              <TextSuggestInput
                id={field.name}
                url={pricingOrderUrls.countryReference}
                value={field.value}
                onChange={field.onChange}
                placeholder="Any"
                clearable
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name={`slices.${index}.city`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>City</FieldLabel>
              <TextSuggestInput
                id={field.name}
                url={pricingOrderUrls.cityReference}
                value={field.value}
                onChange={field.onChange}
                placeholder="Any"
                clearable
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name={`slices.${index}.store`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Store</FieldLabel>
              <TextSuggestInput
                id={field.name}
                url={pricingOrderUrls.storeReference}
                value={field.value}
                onChange={field.onChange}
                placeholder="Any"
                clearable
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>
    </Stack>
  )
}

interface ReportResultProps {
  loading: boolean
  error: string | null
  data: PricingComparisonReport | undefined
}

function ReportResult({ loading, error, data }: ReportResultProps) {
  if (loading) {
    return (
      <Stack orientation="horizontal" align="center" justify="center" gap={2} className="py-16">
        <Spinner className="size-4" />
        <Typography variant="muted">Loading...</Typography>
      </Stack>
    )
  }

  if (error) {
    return (
      <Stack align="center" justify="center" gap={1} className="py-16">
        <Typography variant="small" className="text-destructive">
          Unable to generate report
        </Typography>
        <Typography variant="muted">{error}</Typography>
      </Stack>
    )
  }

  if (!data) {
    return null
  }

  if (data.columns.every((column) => column.empty)) {
    return <EmptyState message="No data for selected slices" />
  }

  if (data.categories.length === 0) {
    return <EmptyState message="No comparable data" />
  }

  return <PricingComparisonTable report={data} />
}

function EmptyState({ message }: { message: string }) {
  return (
    <Stack align="center" justify="center" className="py-16">
      <Typography variant="muted">{message}</Typography>
    </Stack>
  )
}

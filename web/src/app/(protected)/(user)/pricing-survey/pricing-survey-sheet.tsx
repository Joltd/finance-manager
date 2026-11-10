'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { create } from 'zustand'

import { pricingOrderUrls } from '@/api/pricing-order'
import { pricingSurveyUrls } from '@/api/pricing-survey'
import { CurrencyInput } from '@/components/common/input/currency-input'
import { TextSuggestInput } from '@/components/common/input/text-suggest-input'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { Stack } from '@/components/common/layout/stack'
import { useRequest } from '@/hooks/use-request'
import { usePricingSurveyListStore, usePricingSurveyStore } from '@/store/pricing-survey'
import { useUserStore } from '@/store/user'
import { PricingSurvey } from '@/types/pricing-survey'

interface PricingSurveySheetState {
  open: boolean
  pricingSurveyId?: string
  openSheet: (pricingSurveyId?: string) => void
  closeSheet: () => void
}

const usePricingSurveySheetStore = create<PricingSurveySheetState>((set) => ({
  open: false,
  pricingSurveyId: undefined,
  openSheet: (pricingSurveyId) => set({ open: true, pricingSurveyId }),
  closeSheet: () => set({ open: false }),
}))

export function openPricingSurveySheet(pricingSurveyId?: string) {
  usePricingSurveySheetStore.getState().openSheet(pricingSurveyId)
}

const pricingSurveyFormSchema = z.object({
  country: z.string().min(1, 'Required'),
  city: z.string().min(1, 'Required'),
  currency: z.string().min(1, 'Required'),
})

type PricingSurveyFormState = z.infer<typeof pricingSurveyFormSchema>

const pricingSurveyFormResolver = zodResolver(pricingSurveyFormSchema)

function createDefaultFormState(currency?: string): PricingSurveyFormState {
  return {
    country: '',
    city: '',
    currency: currency ?? '',
  }
}

function pricingSurveyToFormState(survey: PricingSurvey): PricingSurveyFormState {
  return {
    country: survey.country,
    city: survey.city,
    currency: survey.currency,
  }
}

export function PricingSurveySheet() {
  const { open, pricingSurveyId, closeSheet } = usePricingSurveySheetStore()
  const pricingSurveyStore = usePricingSurveyStore()
  const listStore = usePricingSurveyListStore()
  const defaultCurrency = useUserStore((state) => state.data?.settings?.operationDefaultCurrency)
  const savePricingSurvey = useRequest(pricingSurveyUrls.root)

  const { control, handleSubmit, reset } = useForm<PricingSurveyFormState>({
    resolver: pricingSurveyFormResolver,
    defaultValues: createDefaultFormState(),
  })

  useEffect(() => {
    if (!open) return
    if (pricingSurveyId) {
      pricingSurveyStore.setPathParams({ id: pricingSurveyId })
      void pricingSurveyStore.fetch()
    } else {
      pricingSurveyStore.reset()
      reset(createDefaultFormState(defaultCurrency))
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const survey = pricingSurveyStore.data
    if (!survey) return
    reset(pricingSurveyToFormState(survey))
  }, [pricingSurveyStore.data]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: PricingSurveyFormState) => {
    await savePricingSurvey.submit({
      body: {
        id: pricingSurveyId,
        country: data.country,
        city: data.city,
        currency: data.currency,
      },
    })
    void listStore.fetch()
    closeSheet()
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) closeSheet()
  }

  const loading = pricingSurveyStore.loading

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{pricingSurveyId ? 'Edit Pricing Survey' : 'New Pricing Survey'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="contents">
          {loading ? (
            <Stack align="center" justify="center" className="flex-1">
              <Spinner />
            </Stack>
          ) : (
            <Stack gap={4} scrollable className="px-4 flex-1">
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
                name="currency"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Currency</FieldLabel>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>Default currency for the prices added to this survey.</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </Stack>
          )}

          <SheetFooter>
            <Button type="submit" disabled={savePricingSurvey.loading || loading}>
              Save
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

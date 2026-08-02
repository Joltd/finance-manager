'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { create } from 'zustand'
import { format } from 'date-fns'

import { pricingOrderUrls } from '@/api/pricing-order'
import { AmountInput } from '@/components/common/input/amount-input'
import { DateInput } from '@/components/common/input/date-input'
import { PricingItemInput } from '@/components/common/input/pricing-item-input'
import { TextSuggestInput } from '@/components/common/input/text-suggest-input'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { Stack } from '@/components/common/layout/stack'
import { useRequest } from '@/hooks/use-request'
import { usePricingOrderListStore, usePricingOrderStore } from '@/store/pricing-order'
import { amountSchema } from '@/types/common/amount'
import { referenceSchema } from '@/types/common/reference'
import { PricingOrder, PricingOrderDefaults } from '@/types/pricing-order'

interface PricingOrderSheetState {
  open: boolean
  pricingOrderId?: string
  openSheet: (pricingOrderId?: string) => void
  closeSheet: () => void
}

const usePricingOrderSheetStore = create<PricingOrderSheetState>((set) => ({
  open: false,
  pricingOrderId: undefined,
  openSheet: (pricingOrderId) => set({ open: true, pricingOrderId }),
  closeSheet: () => set({ open: false }),
}))

export function openPricingOrderSheet(pricingOrderId?: string) {
  usePricingOrderSheetStore.getState().openSheet(pricingOrderId)
}

// The amount schema nests currency errors under `.currency` while a missing
// amount is reported directly on the field itself — surface whichever applies.
function amountFieldErrors(error?: { message?: string; currency?: { message?: string } }) {
  return [error, error?.currency].filter((e): e is { message?: string } => Boolean(e?.message))
}

const pricingOrderFormSchema = z
  .object({
    date: z.date(),
    item: referenceSchema.optional(),
    price: amountSchema.optional(),
    quantity: z.string().min(1, 'Required'),
    country: z.string().min(1, 'Required'),
    city: z.string().min(1, 'Required'),
    store: z.string().min(1, 'Required'),
    comment: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.item) {
      ctx.addIssue({ code: 'custom', path: ['item'], message: 'Required' })
    }
    if (!data.price) {
      ctx.addIssue({ code: 'custom', path: ['price'], message: 'Required' })
    }
  })

type PricingOrderFormState = z.infer<typeof pricingOrderFormSchema>

const pricingOrderFormResolver = zodResolver(pricingOrderFormSchema)

function createDefaultFormState(defaults?: PricingOrderDefaults): PricingOrderFormState {
  return {
    date: defaults?.date ? new Date(defaults.date + 'T00:00:00') : new Date(),
    item: undefined,
    price: defaults?.currency ? { value: 0, currency: defaults.currency } : undefined,
    quantity: '1',
    country: defaults?.country ?? '',
    city: defaults?.city ?? '',
    store: defaults?.store ?? '',
    comment: '',
  }
}

function pricingOrderToFormState(order: PricingOrder): PricingOrderFormState {
  return {
    date: new Date(order.date + 'T00:00:00'),
    item: { id: order.item.id!, name: order.item.name, deleted: false },
    price: order.price,
    quantity: String(order.quantity),
    country: order.country,
    city: order.city,
    store: order.store,
    comment: order.comment ?? '',
  }
}

export function PricingOrderSheet() {
  const { open, pricingOrderId, closeSheet } = usePricingOrderSheetStore()
  const pricingOrderStore = usePricingOrderStore()
  const listStore = usePricingOrderListStore()
  const savePricingOrder = useRequest(pricingOrderUrls.root)
  const defaultsReq = useRequest<PricingOrderDefaults>(pricingOrderUrls.defaults, { method: 'GET' })

  const { control, handleSubmit, reset } = useForm<PricingOrderFormState>({
    resolver: pricingOrderFormResolver,
    defaultValues: createDefaultFormState(),
  })

  useEffect(() => {
    if (!open) return
    if (pricingOrderId) {
      pricingOrderStore.setPathParams({ id: pricingOrderId })
      void pricingOrderStore.fetch()
    } else {
      pricingOrderStore.reset()
      reset(createDefaultFormState())
      void defaultsReq.submit().then((defaults) => reset(createDefaultFormState(defaults)))
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const order = pricingOrderStore.data
    if (!order) return
    reset(pricingOrderToFormState(order))
  }, [pricingOrderStore.data]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: PricingOrderFormState) => {
    await savePricingOrder.submit({
      body: {
        id: pricingOrderId,
        date: format(data.date, 'yyyy-MM-dd'),
        item: { id: data.item!.id },
        price: data.price,
        quantity: Number(data.quantity.replace(',', '.')),
        country: data.country,
        city: data.city,
        store: data.store,
        comment: data.comment || undefined,
      },
    })
    void listStore.fetch()
    closeSheet()
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) closeSheet()
  }

  const loading = pricingOrderStore.loading

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{pricingOrderId ? 'Edit Pricing Order' : 'New Pricing Order'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="contents">
          {loading ? (
            <Stack align="center" justify="center" className="flex-1">
              <Spinner />
            </Stack>
          ) : (
            <Stack gap={4} scrollable className="px-4 flex-1">
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
                name="item"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Item</FieldLabel>
                    <PricingItemInput
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
                    <FieldLabel htmlFor={field.name}>Quantity</FieldLabel>
                    <Input id={field.name} aria-invalid={fieldState.invalid} inputMode="decimal" {...field} />
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
            </Stack>
          )}

          <SheetFooter>
            <Button type="submit" disabled={savePricingOrder.loading || loading}>
              Save
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

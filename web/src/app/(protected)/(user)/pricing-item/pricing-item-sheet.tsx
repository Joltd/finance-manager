'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { create } from 'zustand'

import { pricingItemUrls } from '@/api/pricing-item'
import { TextSuggestInput } from '@/components/common/input/text-suggest-input'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { Stack } from '@/components/common/layout/stack'
import { useRequest } from '@/hooks/use-request'
import { usePricingItemListStore, usePricingItemStore } from '@/store/pricing-item'
import { PricingItem } from '@/types/pricing-item'

interface PricingItemSheetState {
  open: boolean
  pricingItemId?: string
  openSheet: (pricingItemId?: string) => void
  closeSheet: () => void
}

const usePricingItemSheetStore = create<PricingItemSheetState>((set) => ({
  open: false,
  pricingItemId: undefined,
  openSheet: (pricingItemId) => set({ open: true, pricingItemId }),
  closeSheet: () => set({ open: false }),
}))

export function openPricingItemSheet(pricingItemId?: string) {
  usePricingItemSheetStore.getState().openSheet(pricingItemId)
}

const pricingItemFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  category: z.string().min(1, 'Required'),
  unit: z.string().min(1, 'Required'),
  defaultQuantity: z.string().min(1, 'Required'),
})

type PricingItemFormState = z.infer<typeof pricingItemFormSchema>

const pricingItemFormResolver = zodResolver(pricingItemFormSchema)

function createDefaultFormState(): PricingItemFormState {
  return {
    name: '',
    category: '',
    unit: '',
    defaultQuantity: '1',
  }
}

function pricingItemToFormState(item: PricingItem): PricingItemFormState {
  return {
    name: item.name,
    category: item.category,
    unit: item.unit,
    defaultQuantity: String(item.defaultQuantity),
  }
}

export function PricingItemSheet() {
  const { open, pricingItemId, closeSheet } = usePricingItemSheetStore()
  const pricingItemStore = usePricingItemStore()
  const listStore = usePricingItemListStore()
  const savePricingItem = useRequest(pricingItemUrls.root)

  const { control, handleSubmit, reset } = useForm<PricingItemFormState>({
    resolver: pricingItemFormResolver,
    defaultValues: createDefaultFormState(),
  })

  useEffect(() => {
    if (open) {
      if (pricingItemId) {
        pricingItemStore.setPathParams({ id: pricingItemId })
        void pricingItemStore.fetch()
      } else {
        pricingItemStore.reset()
        reset(createDefaultFormState())
      }
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const item = pricingItemStore.data
    if (!item) return
    reset(pricingItemToFormState(item))
  }, [pricingItemStore.data]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: PricingItemFormState) => {
    await savePricingItem.submit({
      body: {
        id: pricingItemId,
        name: data.name,
        category: data.category,
        unit: data.unit,
        defaultQuantity: Number(data.defaultQuantity.replace(',', '.')),
      },
    })
    void listStore.fetch()
    closeSheet()
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) closeSheet()
  }

  const loading = pricingItemStore.loading

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{pricingItemId ? 'Edit Pricing Item' : 'New Pricing Item'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="contents">
          {loading ? (
            <Stack align="center" justify="center" className="flex-1">
              <Spinner />
            </Stack>
          ) : (
            <Stack gap={4} scrollable className="px-4 flex-1">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input id={field.name} aria-invalid={fieldState.invalid} {...field} />
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
            </Stack>
          )}

          <SheetFooter>
            <Button type="submit" disabled={savePricingItem.loading || loading}>
              Save
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

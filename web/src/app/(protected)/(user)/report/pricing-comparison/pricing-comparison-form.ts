import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'

import { PricingComparisonFilter } from '@/types/report'

// keep in sync with PricingComparisonReportService.MAX_SLICES
export const MAX_SLICES = 5

const sliceSchema = z
  .object({
    from: z.date().optional(),
    to: z.date().optional(),
    country: z.string(),
    city: z.string(),
    store: z.string(),
  })
  .superRefine((slice, ctx) => {
    if (!slice.from) {
      ctx.addIssue({ code: 'custom', path: ['from'], message: 'Required' })
    }
    if (!slice.to) {
      ctx.addIssue({ code: 'custom', path: ['to'], message: 'Required' })
    }
    if (slice.from && slice.to && slice.from.getTime() > slice.to.getTime()) {
      ctx.addIssue({ code: 'custom', path: ['to'], message: 'Must not be before From' })
    }
  })

export const pricingComparisonFormSchema = z.object({
  slices: z
    .array(sliceSchema)
    .min(1, 'Add at least one slice')
    .max(MAX_SLICES, `No more than ${MAX_SLICES} slices`),
})

export type PricingComparisonFormState = z.infer<typeof pricingComparisonFormSchema>
export type PricingComparisonSliceFormState = PricingComparisonFormState['slices'][number]

export const pricingComparisonFormResolver = zodResolver(pricingComparisonFormSchema)

export function createEmptySlice(): PricingComparisonSliceFormState {
  return { from: undefined, to: undefined, country: '', city: '', store: '' }
}

export function createDefaultFormState(): PricingComparisonFormState {
  return { slices: [createEmptySlice()] }
}

// expects validated form state: both dates are present in every slice
export function toPricingComparisonFilter(data: PricingComparisonFormState): PricingComparisonFilter {
  return {
    slices: data.slices.map((slice) => ({
      date: {
        from: format(slice.from!, 'yyyy-MM-dd'),
        to: format(slice.to!, 'yyyy-MM-dd'),
      },
      country: slice.country.trim() || undefined,
      city: slice.city.trim() || undefined,
      store: slice.store.trim() || undefined,
    })),
  }
}

import z from 'zod'

export interface Reference {
  id: string
  name: string
}

export const referenceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3),
})

export interface RangeValue<T> {
  from?: T
  to?: T
}

export interface Amount {
  value: number
  currency: string
}

export const amountShema = z.object({
  value: z.number(),
  currency: z.string(),
})

export function amount(value: number, currency: string): Amount {
  return { value: value * 10000, currency }
}

export function plus(left?: Amount, right?: Amount): Amount | undefined {
  if (!left && !right) {
    return
  }

  return {
    value: (left?.value || 0) + (right?.value || 0),
    currency: (left?.currency || right?.currency)!!,
  }
}

export function minus(left?: Amount, right?: Amount): Amount | undefined {
  if (!left && !right) {
    return
  }

  return {
    value: (left?.value || 0) - (right?.value || 0),
    currency: (left?.currency || right?.currency)!!,
  }
}

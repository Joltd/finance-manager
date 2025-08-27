import z from 'zod/index'

export interface Reference {
  id: string
  name: string
}

export const referenceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3),
})

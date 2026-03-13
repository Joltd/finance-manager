import { z } from 'zod'

export interface Reference {
  id: string
  name: string
  deleted: boolean
}

export const referenceSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  deleted: z.boolean(),
})

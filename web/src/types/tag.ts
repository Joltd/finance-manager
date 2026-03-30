import { z } from 'zod'

export interface Tag {
  id?: string
  name: string
  deleted: boolean
}

export const tagSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  deleted: z.boolean(),
})

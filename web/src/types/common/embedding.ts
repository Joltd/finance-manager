import z from 'zod'

export interface Embedding {
  id: string
  input?: string
}

export const embeddingSchema = z.object({
  id: z.string().uuid(),
  input: z.string().optional(),
})

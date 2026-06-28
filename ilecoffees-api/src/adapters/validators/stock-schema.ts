import { z } from 'zod'

export const adjustStockSchema = z.object({
  delta: z.number(),
  type: z.enum(['ENTRY', 'ADJUSTMENT']),
  reason: z.string().optional(),
})

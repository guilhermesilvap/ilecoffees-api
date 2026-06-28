import { z } from 'zod'

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(500).optional().nullable(),
})

export const revenuePeriodQuerySchema = z.object({
  period: z.enum(['monthly', 'weekly']).default('monthly'),
  limit: z.coerce.number().int().min(1).max(52).default(12),
})

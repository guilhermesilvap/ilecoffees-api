import { z } from 'zod'

export const subscriptionCreateSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  monthlyPrice: z.number().positive(),
  annualPrice: z.number().positive(),
  quantity: z.number().positive().optional(),
  coffeeIds: z.array(z.string().uuid()).min(1, 'Pelo menos um café deve ser selecionado'),
})

export const subscriptionQuerySchema = z.object({
  name: z.string().trim().optional(),
  description: z.string().trim().optional(),
  monthlyPrice: z.coerce.number().min(0).optional(),
  annualPrice: z.coerce.number().min(0).optional(),
  quantity: z.coerce.number().min(0).optional(),
  supplierId: z.string().uuid().optional(),
})

export const subscriptionUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  monthlyPrice: z.number().positive().optional(),
  annualPrice: z.number().positive().optional(),
  quantity: z.number().positive().nullable().optional(),
  coffeeIds: z.array(z.string().uuid()).min(1).optional(),
})

export type SubscriptionCreateInput = z.infer<typeof subscriptionCreateSchema>
export type SubscriptionUpdateInput = z.infer<typeof subscriptionUpdateSchema>
export type SubscriptionQueryInput = z.infer<typeof subscriptionQuerySchema>

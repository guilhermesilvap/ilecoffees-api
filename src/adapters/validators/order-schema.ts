import { z } from 'zod'

export const createSubscriptionOrderSchema = z.object({
  subscriptionId: z.string().uuid({ message: 'ID da assinatura inválido' }),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELED']),
})

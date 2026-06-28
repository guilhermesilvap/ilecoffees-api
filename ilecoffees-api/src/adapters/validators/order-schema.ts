import { z } from 'zod'

export const listAllOrdersQuerySchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELED']).optional(),
  type: z.enum(['ONE_TIME', 'SUBSCRIPTION', 'COURSE']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

export const createOrderSchema = z.object({
  deliveryCep: z.string().min(8).max(9).optional(),
  shippingChoices: z
    .array(
      z.object({
        supplierId: z.string().uuid(),
        carrier: z.string(),
        shippingCost: z.number().nonnegative(),
        deadlineDays: z.number().int().positive(),
      }),
    )
    .optional(),
})

export const createSubscriptionOrderSchema = z.object({
  subscriptionId: z.string().uuid({ message: 'ID da assinatura inválido' }),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['SHIPPED', 'DELIVERED', 'CANCELED']),
  trackingCode: z.string().optional(),
})

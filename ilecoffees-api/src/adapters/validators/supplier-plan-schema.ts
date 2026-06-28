import { z } from 'zod'

export const listSuppliersQuerySchema = z.object({
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

export const supplierPlanCreateSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.number().nonnegative(),
  maxProducts: z.number().int().positive().optional().nullable(),
})

export const supplierPlanUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  price: z.number().nonnegative().optional(),
  maxProducts: z.number().int().positive().optional().nullable(),
})

export const assignSupplierPlanSchema = z.object({
  planId: z.string().uuid().nullable(),
})

export const toggleSupplierStatusSchema = z.object({
  isActive: z.boolean(),
})

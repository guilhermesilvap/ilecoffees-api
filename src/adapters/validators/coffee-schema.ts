import { z } from 'zod'

const pricingRefinement = (data: {
  saleType?: string
  pricePerKg?: number
  packagePrice?: number
  packageWeight?: number
}) => {
  if (data.saleType === 'KG') return !!data.pricePerKg
  if (data.saleType === 'PACKAGE') return !!data.packagePrice && !!data.packageWeight
  return true
}

export const coffeeCreateSchema = z
  .object({
    name: z.string().min(2),
    description: z.string().min(5),
    variety: z.string().min(2),
    process: z.string().min(2),
    region: z.string().min(2),
    altitude: z.number().min(1),
    farm: z.string().min(2),
    producer: z.string().min(2),
    score: z.number().min(1),
    sensory: z.string().min(2),
    roast: z.string().min(2),
    saleType: z.enum(['KG', 'PACKAGE']),
    pricePerKg: z.number().positive().optional(),
    packagePrice: z.number().positive().optional(),
    packageWeight: z.number().positive().optional(),
    stock: z.number().positive().optional(),
  })
  .refine(pricingRefinement, {
    message: 'Campos de preço não foram preenchidos corretamente de acordo com o tipo de venda.',
  })

export const coffeeUpdateSchema = z
  .object({
    name: z.string().min(2).optional(),
    description: z.string().min(5).optional(),
    variety: z.string().min(2).optional(),
    process: z.string().min(2).optional(),
    region: z.string().min(2).optional(),
    altitude: z.number().min(1).optional(),
    farm: z.string().min(2).optional(),
    producer: z.string().min(2).optional(),
    score: z.number().min(1).optional(),
    sensory: z.string().min(2).optional(),
    roast: z.string().min(2).optional(),
    saleType: z.enum(['KG', 'PACKAGE']).optional(),
    pricePerKg: z.number().positive().optional(),
    packagePrice: z.number().positive().optional(),
    packageWeight: z.number().positive().optional(),
    stock: z.number().positive().optional(),
  })
  .refine(pricingRefinement, {
    message: 'Campos de preço não foram preenchidos corretamente de acordo com o tipo de venda.',
  })

export const coffeeQuerySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  variety: z.string().optional(),
  process: z.string().optional(),
  region: z.string().optional(),
  altitude: z.coerce.number().optional(),
  farm: z.string().optional(),
  producer: z.string().optional(),
  score: z.coerce.number().optional(),
  sensory: z.string().optional(),
  roast: z.string().optional(),
  saleType: z.enum(['KG', 'PACKAGE']).optional(),
  pricePerKg: z.coerce.number().optional(),
  packagePrice: z.coerce.number().optional(),
  packageWeight: z.coerce.number().optional(),
  stock: z.coerce.number().optional(),
  supplierId: z.string().optional(),
})

export type CoffeeCreateInput = z.infer<typeof coffeeCreateSchema>
export type CoffeeUpdateInput = z.infer<typeof coffeeUpdateSchema>
export type CoffeeQueryInput = z.infer<typeof coffeeQuerySchema>

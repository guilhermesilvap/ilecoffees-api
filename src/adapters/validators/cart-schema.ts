import { z } from 'zod'

export const addToCartSchema = z.object({
  coffeeId: z.string().uuid({ message: 'ID do café inválido' }),
  quantity: z.number().int().positive({ message: 'Quantidade deve ser um número inteiro positivo' }),
})

export const removeFromCartSchema = z.object({
  coffeeId: z.string().uuid({ message: 'ID do café inválido' }),
})

export type AddToCartInput = z.infer<typeof addToCartSchema>

import { z } from 'zod'

export const addToCartSchema = z.object({
  coffeeId: z.string().uuid({ message: 'ID do café inválido' }),
  quantity: z.number().positive({ message: 'Quantidade deve ser maior que zero' }).min(0.5, { message: 'Quantidade mínima é 0,5' }),
})

export const removeFromCartSchema = z.object({
  coffeeId: z.string().uuid({ message: 'ID do café inválido' }),
})

export const updateCartItemSchema = z.object({
  quantity: z.number().positive({ message: 'Quantidade deve ser maior que zero' }).min(0.5),
})

export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>

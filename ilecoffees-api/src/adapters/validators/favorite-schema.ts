import { z } from 'zod'

export const addFavoriteSchema = z.object({
  coffeeId: z.string().uuid({ message: 'ID do café inválido' }),
})

export const removeFavoriteSchema = z.object({
  coffeeId: z.string().uuid({ message: 'ID do café inválido' }),
})

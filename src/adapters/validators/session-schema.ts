import { z } from 'zod'

export const sessionCreateSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido' }),
  password: z.string(),
})

export type SessionCreateInput = z.infer<typeof sessionCreateSchema>

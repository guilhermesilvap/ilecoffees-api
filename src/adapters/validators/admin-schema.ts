import { z } from 'zod'

export const adminCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email({ message: 'Digite um e-mail válido' }),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
      message: 'Senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais',
    }),
})

export type AdminCreateInput = z.infer<typeof adminCreateSchema>

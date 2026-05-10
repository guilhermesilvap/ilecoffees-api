import { z } from 'zod'

export const userCreateSchema = z.object({
  accountType: z.enum(['INDIVIDUAL', 'COMPANY']),
  name: z.string().min(2, { message: 'Você precisa digitar um nome com pelo menos 2 caracteres' }),
  email: z.string().email(),
  phoneNumber: z
    .string()
    .min(10)
    .max(15)
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, { message: 'Número de telefone inválido' }),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
      message: 'Senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais',
    }),
  cep: z.string().length(8, { message: 'CEP deve ter 8 dígitos' }),
  street: z.string(),
  number: z.string(),
  district: z.string(),
  city: z.string(),
  state: z.string().length(2, 'UF deve ter 2 letras'),
  complement: z.string().optional(),
})

export const userUpdateSchema = z.object({
  name: z.string().min(2, { message: 'Você precisa digitar um nome com pelo menos 2 caracteres' }).optional(),
  phoneNumber: z
    .string()
    .min(10)
    .max(15)
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, { message: 'Número de telefone inválido' })
    .optional(),
  cep: z.string().length(8, { message: 'CEP deve ter 8 dígitos' }).optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2, 'UF deve ter 2 letras').optional(),
  complement: z.string().optional(),
})

export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>

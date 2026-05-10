import { z } from 'zod'

export const supplierCreateSchema = z.object({
  name: z.string().min(2, { message: 'Você precisa digitar um nome com pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'Digite um e-mail válido' }),
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

export const supplierUpdateSchema = z.object({
  name: z.string().min(2, { message: 'Você precisa digitar um nome com pelo menos 2 caracteres' }).optional(),
  cep: z.string().length(8, { message: 'CEP deve ter 8 dígitos' }).optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2, 'UF deve ter 2 letras').optional(),
  complement: z.string().optional(),
})

export type SupplierCreateInput = z.infer<typeof supplierCreateSchema>
export type SupplierUpdateInput = z.infer<typeof supplierUpdateSchema>

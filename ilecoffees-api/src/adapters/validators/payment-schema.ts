import { z } from 'zod'

export const createPaymentSchema = z
  .object({
    orderId: z.string().uuid({ message: 'ID do pedido inválido' }),
    method: z.enum(['CREDIT_CARD', 'PIX']),
    cardToken: z.string().optional(),
    installments: z.number().int().min(1).max(12).default(1),
    paymentMethodId: z.string().optional(),
    issuerId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method === 'CREDIT_CARD' && !data.cardToken) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Token do cartão é obrigatório para pagamento com cartão de crédito',
        path: ['cardToken'],
      })
    }
  })

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>

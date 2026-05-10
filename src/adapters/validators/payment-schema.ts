import { z } from 'zod'

export const createPaymentSchema = z.object({
  orderId: z.string().uuid({ message: 'ID do pedido inválido' }),
  method: z.enum(['CREDIT_CARD', 'PIX', 'BOLETO', 'MERCADO_PAGO', 'STRIPE']),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>

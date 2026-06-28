import { Request, Response } from 'express'
import crypto from 'crypto'
import { AppError } from '@/utils/AppError'
import { createPaymentSchema } from '@/adapters/validators/payment-schema'
import { CreatePaymentUseCase } from '@/use-cases/create-payment'
import { ListPaymentsUseCase } from '@/use-cases/list-payments'
import { GetPaymentStatusUseCase } from '@/use-cases/get-payment-status'
import { ProcessPaymentWebhookUseCase } from '@/use-cases/process-payment-webhook'
import { env } from '@/env'

export class PaymentsController {
  constructor(
    private createPaymentUseCase: CreatePaymentUseCase,
    private listPaymentsUseCase: ListPaymentsUseCase,
    private getPaymentStatusUseCase: GetPaymentStatusUseCase,
    private processPaymentWebhookUseCase: ProcessPaymentWebhookUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') throw new AppError('Apenas usuários podem realizar pagamentos', 403)

    const { orderId, method, cardToken, installments, paymentMethodId, issuerId } = createPaymentSchema.parse(req.body)

    const result = await this.createPaymentUseCase.execute({
      orderId,
      method,
      userId: req.user.id,
      cardToken,
      installments,
      paymentMethodId,
      issuerId,
    })

    res.status(201).json(result)
  }

  index = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') throw new AppError('Apenas usuários podem ver pagamentos', 403)
    const payments = await this.listPaymentsUseCase.execute(req.user.id)
    res.status(200).json(payments)
  }

  status = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') throw new AppError('Acesso negado', 403)
    const { orderId } = req.params
    const payment = await this.getPaymentStatusUseCase.execute(orderId, req.user.id)
    res.status(200).json(payment)
  }

  webhook = async (req: Request, res: Response): Promise<void> => {
    const secret = env.MP_WEBHOOK_SECRET
    if (secret) {
      const xSignature = req.headers['x-signature'] as string | undefined
      const xRequestId = req.headers['x-request-id'] as string | undefined
      const dataId = (req.query['data.id'] ?? req.body?.data?.id) as string | undefined

      if (!xSignature || !xRequestId || !dataId) {
        res.status(401).json({ message: 'Missing signature headers' })
        return
      }

      const ts = xSignature.split(',').find(p => p.startsWith('ts='))?.split('=')[1] ?? ''
      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
      const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
      const v1 = xSignature.split(',').find(p => p.startsWith('v1='))?.split('=')[1]
      if (v1 !== hmac) {
        res.status(401).json({ message: 'Invalid signature' })
        return
      }
    }

    const { type, data } = req.body
    if (type !== 'payment' || !data?.id) {
      res.status(200).json({ received: true })
      return
    }

    // Responde ao MP imediatamente; fulfillment roda em background
    res.status(200).json({ received: true })
    this.processPaymentWebhookUseCase.execute(String(data.id)).catch(console.error)
  }
}

import { Request, Response } from 'express'
import { AppError } from '@/utils/AppError'
import { createPaymentSchema } from '@/adapters/validators/payment-schema'
import { CreatePaymentUseCase } from '@/use-cases/create-payment'
import { ListPaymentsUseCase } from '@/use-cases/list-payments'

export class PaymentsController {
  constructor(
    private createPaymentUseCase: CreatePaymentUseCase,
    private listPaymentsUseCase: ListPaymentsUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') throw new AppError('Apenas usuários podem realizar pagamentos', 403)
    const { orderId, method } = createPaymentSchema.parse(req.body)
    const payment = await this.createPaymentUseCase.execute({ orderId, method, userId: req.user.id })
    res.status(201).json(payment)
  }

  index = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') throw new AppError('Apenas usuários podem ver pagamentos', 403)
    const payments = await this.listPaymentsUseCase.execute(req.user.id)
    res.status(200).json(payments)
  }
}

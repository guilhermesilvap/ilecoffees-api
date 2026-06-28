import { AppError } from '@/utils/AppError'
import { Payment } from '@/entities/payment'
import { PaymentsRepository } from '@/repositories/payments-repository'
import { OrdersRepository } from '@/repositories/orders-repository'
import { FulfillApprovedOrderUseCase } from './fulfill-approved-order'
import { mpPaymentService } from '@/services/mercadopago-payment-service'
import { env } from '@/env'

export class GetPaymentStatusUseCase {
  constructor(
    private paymentsRepository: PaymentsRepository,
    private ordersRepository: OrdersRepository,
    private fulfillApprovedOrderUseCase: FulfillApprovedOrderUseCase,
  ) {}

  async execute(orderId: string, userId: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findByOrderId(orderId)
    if (!payment) throw new AppError('Pagamento não encontrado', 404)

    const order = await this.ordersRepository.findById(orderId)
    if (!order) throw new AppError('Pedido não encontrado', 404)
    if (order.userId !== userId) throw new AppError('Acesso negado', 403)

    if (payment.status !== 'PENDING') return payment

    // PIX expirado antes de ser pago
    if (payment.pixExpiresAt && payment.pixExpiresAt < new Date()) {
      return this.paymentsRepository.updateStatus(payment.id!, 'FAILED')
    }

    if (!payment.externalId || !env.MP_ACCESS_TOKEN) return payment

    const mpStatus = await mpPaymentService.getStatus(payment.externalId).catch(() => null)
    if (!mpStatus) return payment

    if (mpStatus === 'approved') {
      const updated = await this.paymentsRepository.updateStatus(payment.id!, 'SUCCESS', new Date())
      await this.ordersRepository.updateStatus(orderId, 'PAID')
      await this.fulfillApprovedOrderUseCase.execute(order)
      return updated
    }

    if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
      return this.paymentsRepository.updateStatus(payment.id!, 'FAILED')
    }

    // in_process: antifraude em andamento, retorna PENDING sem alteração
    return payment
  }
}

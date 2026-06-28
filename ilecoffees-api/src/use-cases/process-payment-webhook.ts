import { PaymentsRepository } from '@/repositories/payments-repository'
import { OrdersRepository } from '@/repositories/orders-repository'
import { FulfillApprovedOrderUseCase } from './fulfill-approved-order'
import { mpPaymentService } from '@/services/mercadopago-payment-service'
import { env } from '@/env'

export class ProcessPaymentWebhookUseCase {
  constructor(
    private paymentsRepository: PaymentsRepository,
    private ordersRepository: OrdersRepository,
    private fulfillApprovedOrderUseCase: FulfillApprovedOrderUseCase,
  ) {}

  async execute(mpPaymentId: string): Promise<void> {
    if (!env.MP_ACCESS_TOKEN) return

    const payment = await this.paymentsRepository.findByExternalId(mpPaymentId)
    if (!payment || payment.status !== 'PENDING') return

    const mpStatus = await mpPaymentService.getStatus(mpPaymentId).catch(() => null)
    if (!mpStatus) return

    if (mpStatus === 'approved') {
      const order = await this.ordersRepository.findById(payment.orderId)
      if (!order) return

      await this.paymentsRepository.updateStatus(payment.id!, 'SUCCESS', new Date())
      await this.ordersRepository.updateStatus(order.id!, 'PAID')
      await this.fulfillApprovedOrderUseCase.execute(order)
      return
    }

    if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
      await this.paymentsRepository.updateStatus(payment.id!, 'FAILED')
    }
  }
}

import { AppError } from '@/utils/AppError'
import { SubscriptionDelivery } from '@/entities/subscription-delivery'
import { OrdersRepository } from '@/repositories/orders-repository'
import { SubscriptionDeliveriesRepository } from '@/repositories/subscription-deliveries-repository'

export class ListSubscriptionDeliveriesUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private deliveriesRepository: SubscriptionDeliveriesRepository,
  ) {}

  async execute(orderId: string, userId: string): Promise<SubscriptionDelivery[]> {
    const order = await this.ordersRepository.findById(orderId)
    if (!order) throw new AppError('Pedido não encontrado', 404)
    if (order.userId !== userId) throw new AppError('Acesso negado', 403)
    if (order.type !== 'SUBSCRIPTION') throw new AppError('Este pedido não é uma assinatura', 400)

    return this.deliveriesRepository.listByOrder(orderId)
  }
}

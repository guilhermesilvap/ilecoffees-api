import { AppError } from '@/utils/AppError'
import { Order } from '@/entities/order'
import { OrdersRepository } from '@/repositories/orders-repository'

export class PauseSubscriptionUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute(orderId: string, userId: string): Promise<Order> {
    const order = await this.ordersRepository.findById(orderId)
    if (!order) throw new AppError('Pedido não encontrado', 404)
    if (order.userId !== userId) throw new AppError('Acesso negado', 403)
    if (order.type !== 'SUBSCRIPTION') throw new AppError('Este pedido não é uma assinatura', 400)
    if (order.subscriptionStatus === 'PAUSED') throw new AppError('Assinatura já está pausada', 400)
    if (order.subscriptionStatus === 'CANCELED') throw new AppError('Assinatura cancelada não pode ser pausada', 400)

    return this.ordersRepository.updateSubscriptionStatus(orderId, 'PAUSED', new Date())
  }
}

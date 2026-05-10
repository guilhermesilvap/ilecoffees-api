import { AppError } from '@/utils/AppError'
import { Order } from '@/entities/order'
import { OrdersRepository } from '@/repositories/orders-repository'

export class CancelOrderUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute(id: string, userId: string): Promise<Order> {
    const order = await this.ordersRepository.findById(id)

    if (!order) throw new AppError('Pedido não encontrado', 404)
    if (order.userId !== userId) throw new AppError('Você não tem permissão para cancelar este pedido', 403)
    if (order.status !== 'PENDING') throw new AppError('Apenas pedidos pendentes podem ser cancelados')

    return this.ordersRepository.updateStatus(id, 'CANCELED')
  }
}

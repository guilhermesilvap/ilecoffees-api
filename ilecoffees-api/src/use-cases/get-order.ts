import { AppError } from '@/utils/AppError'
import { Order } from '@/entities/order'
import { OrdersRepository } from '@/repositories/orders-repository'

export class GetOrderUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute(id: string, userId: string): Promise<Order> {
    const order = await this.ordersRepository.findById(id)
    if (!order) throw new AppError('Pedido não encontrado', 404)
    if (order.userId !== userId) throw new AppError('Acesso negado', 403)
    return order
  }
}

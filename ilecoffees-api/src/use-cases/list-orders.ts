import { Order } from '@/entities/order'
import { OrdersRepository } from '@/repositories/orders-repository'

export class ListOrdersUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute(userId: string): Promise<Order[]> {
    return this.ordersRepository.listByUser(userId)
  }
}

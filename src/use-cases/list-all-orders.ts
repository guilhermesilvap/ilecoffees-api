import { Order } from '@/entities/order'
import { OrdersRepository } from '@/repositories/orders-repository'

export class ListAllOrdersUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute(): Promise<Order[]> {
    return this.ordersRepository.listAll()
  }
}

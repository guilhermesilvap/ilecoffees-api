import { Order } from '@/entities/order'
import { OrdersRepository } from '@/repositories/orders-repository'

export class ListSupplierOrdersUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute(supplierId: string): Promise<Order[]> {
    return this.ordersRepository.listBySupplier(supplierId)
  }
}

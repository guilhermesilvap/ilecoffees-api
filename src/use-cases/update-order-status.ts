import { AppError } from '@/utils/AppError'
import { Order, OrderStatus } from '@/entities/order'
import { OrdersRepository } from '@/repositories/orders-repository'

interface UpdateOrderStatusInput {
  id: string
  status: OrderStatus
}

export class UpdateOrderStatusUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({ id, status }: UpdateOrderStatusInput): Promise<Order> {
    const order = await this.ordersRepository.findById(id)
    if (!order) throw new AppError('Pedido não encontrado', 404)
    return this.ordersRepository.updateStatus(id, status)
  }
}

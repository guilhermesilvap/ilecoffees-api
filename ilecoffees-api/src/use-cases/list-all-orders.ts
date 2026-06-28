import { Order, OrderStatus, OrderType } from '@/entities/order'
import { OrdersRepository } from '@/repositories/orders-repository'

export interface ListAllOrdersInput {
  status?: OrderStatus
  type?: OrderType
  page?: number
  limit?: number
}

export interface ListAllOrdersResult {
  items: Order[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class ListAllOrdersUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute(input?: ListAllOrdersInput): Promise<ListAllOrdersResult> {
    const page = Math.max(1, input?.page ?? 1)
    const limit = Math.min(100, Math.max(1, input?.limit ?? 30))
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      this.ordersRepository.listAll({ status: input?.status, type: input?.type, skip, take: limit }),
      this.ordersRepository.countAll({ status: input?.status, type: input?.type }),
    ])

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }
}

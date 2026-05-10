import { BillingCycle, Order, OrderStatus, OrderType } from '@/entities/order'

export interface CreateOrderDTO {
  userId: string
  coffeeId?: string | null
  subscriptionId?: string | null
  courseId?: string | null
  quantity?: number | null
  billingCycle?: BillingCycle | null
  totalPrice: number
  type: OrderType
}

export interface OrdersRepository {
  create(data: CreateOrderDTO): Promise<Order>
  listByUser(userId: string): Promise<Order[]>
  listAll(): Promise<Order[]>
  findById(id: string): Promise<Order | null>
  findActiveByUserAndSubscription(userId: string, subscriptionId: string): Promise<Order | null>
  updateStatus(id: string, status: OrderStatus): Promise<Order>
}

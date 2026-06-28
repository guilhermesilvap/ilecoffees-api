import { BillingCycle, Order, OrderStatus, OrderType, SubscriptionStatus } from '@/entities/order'

export interface CreateOrderDTO {
  userId?: string | null
  buyerSupplierId?: string | null
  coffeeId?: string | null
  subscriptionId?: string | null
  courseId?: string | null
  quantity?: number | null
  billingCycle?: BillingCycle | null
  totalPrice: number
  shippingCost?: number | null
  deliveryCep?: string | null
  shippingCarrier?: string | null
  shippingDeadlineDays?: number | null
  type: OrderType
}

export interface ListAllOrdersFilters {
  status?: OrderStatus
  type?: OrderType
  skip?: number
  take?: number
}

export interface OrdersRepository {
  create(data: CreateOrderDTO): Promise<Order>
  createBatch(items: CreateOrderDTO[]): Promise<Order[]>
  listByUser(userId: string): Promise<Order[]>
  listBySupplier(supplierId: string): Promise<Order[]>
  listByBuyerSupplier(supplierId: string): Promise<Order[]>
  listAll(filters?: ListAllOrdersFilters): Promise<Order[]>
  countAll(filters?: Pick<ListAllOrdersFilters, 'status' | 'type'>): Promise<number>
  findById(id: string): Promise<Order | null>
  findActiveByUserAndSubscription(userId: string, subscriptionId: string): Promise<Order | null>
  findActiveCourseOrder(userId: string, courseId: string): Promise<Order | null>
  updateStatus(id: string, status: OrderStatus, trackingCode?: string | null): Promise<Order>
  updateSubscriptionStatus(id: string, subscriptionStatus: SubscriptionStatus, pausedAt?: Date | null): Promise<Order>
}

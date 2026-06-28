import { SubscriptionDelivery } from '@/entities/subscription-delivery'

export interface CreateSubscriptionDeliveryDTO {
  orderId: string
  coffeeId: string
  quantity: number
  notes?: string | null
}

export interface SubscriptionDeliveriesRepository {
  create(data: CreateSubscriptionDeliveryDTO): Promise<SubscriptionDelivery>
  listByOrder(orderId: string): Promise<SubscriptionDelivery[]>
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELED'
export type OrderType = 'ONE_TIME' | 'SUBSCRIPTION' | 'COURSE'
export type BillingCycle = 'MONTHLY' | 'ANNUAL'
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELED'

export interface OrderData {
  id?: string
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
  status: OrderStatus
  trackingCode?: string | null
  subscriptionStatus?: SubscriptionStatus | null
  pausedAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
  user?: { id: string; name: string; email: string; phoneNumber?: string; cpf?: string | null } | null
  buyerSupplier?: { id: string; name: string; email: string } | null
  coffee?: { id: string; name: string; photoUrl?: string | null; saleType: string; supplierId: string } | null
  subscription?: { id: string; name: string; supplierId: string } | null
  course?: { id: string; title: string; imageUrl?: string | null; supplierId?: string | null } | null
}

export class Order {
  id?: string
  userId?: string | null
  buyerSupplierId?: string | null
  coffeeId?: string | null
  subscriptionId?: string | null
  courseId?: string | null
  quantity?: number | null
  billingCycle?: BillingCycle | null
  totalPrice!: number
  shippingCost?: number | null
  deliveryCep?: string | null
  shippingCarrier?: string | null
  shippingDeadlineDays?: number | null
  type!: OrderType
  status!: OrderStatus
  trackingCode?: string | null
  subscriptionStatus?: SubscriptionStatus | null
  pausedAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
  user?: { id: string; name: string; email: string; phoneNumber?: string; cpf?: string | null } | null
  buyerSupplier?: { id: string; name: string; email: string } | null
  coffee?: { id: string; name: string; photoUrl?: string | null; saleType: string; supplierId: string } | null
  subscription?: { id: string; name: string; supplierId: string } | null
  course?: { id: string; title: string; imageUrl?: string | null; supplierId?: string | null } | null

  constructor(data: OrderData) {
    Object.assign(this, data)
  }
}

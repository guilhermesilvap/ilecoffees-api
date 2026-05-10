export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELED'
export type OrderType = 'ONE_TIME' | 'SUBSCRIPTION' | 'COURSE'
export type BillingCycle = 'MONTHLY' | 'ANNUAL'

export interface OrderData {
  id?: string
  userId: string
  coffeeId?: string | null
  subscriptionId?: string | null
  courseId?: string | null
  quantity?: number | null
  billingCycle?: BillingCycle | null
  totalPrice: number
  type: OrderType
  status: OrderStatus
  createdAt?: Date
  updatedAt?: Date
}

export class Order {
  id?: string
  userId!: string
  coffeeId?: string | null
  subscriptionId?: string | null
  courseId?: string | null
  quantity?: number | null
  billingCycle?: BillingCycle | null
  totalPrice!: number
  type!: OrderType
  status!: OrderStatus
  createdAt?: Date
  updatedAt?: Date

  constructor(data: OrderData) {
    Object.assign(this, data)
  }
}

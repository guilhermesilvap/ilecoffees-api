export interface SubscriptionDeliveryData {
  id?: string
  orderId: string
  coffeeId: string
  quantity: number
  deliveredAt?: Date
  notes?: string | null
  coffee?: { id: string; name: string; photoUrl?: string | null } | null
}

export class SubscriptionDelivery {
  id?: string
  orderId!: string
  coffeeId!: string
  quantity!: number
  deliveredAt?: Date
  notes?: string | null
  coffee?: SubscriptionDeliveryData['coffee']

  constructor(data: SubscriptionDeliveryData) {
    Object.assign(this, data)
  }
}

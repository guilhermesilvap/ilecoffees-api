import { Coffee } from './coffee'

export interface SubscriptionData {
  id?: string
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  quantity?: number | null
  supplierId: string
  coffees?: Coffee[]
  deletedAt?: Date | null
  createdAt?: Date
}

export class Subscription {
  id?: string
  name!: string
  description!: string
  monthlyPrice!: number
  annualPrice!: number
  quantity?: number | null
  supplierId!: string
  coffees?: Coffee[]
  deletedAt?: Date | null
  createdAt?: Date

  constructor(data: SubscriptionData) {
    this.validate(data)
    Object.assign(this, data)
  }

  private validate(data: SubscriptionData) {
    if (!data.coffees || data.coffees.length === 0) return
    const hasKgCoffee = data.coffees.some((c) => c.saleType === 'KG')
    if (hasKgCoffee) {
      throw new Error('Cafés vendidos por KG não podem ser adicionados em assinaturas')
    }
  }
}

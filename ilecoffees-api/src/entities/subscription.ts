import { Coffee } from './coffee'

export interface SubscriptionData {
  id?: string
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  coffeeshopMonthlyPrice?: number | null
  coffeeshopAnnualPrice?: number | null
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
  coffeeshopMonthlyPrice?: number | null
  coffeeshopAnnualPrice?: number | null
  quantity?: number | null
  supplierId!: string
  coffees?: Coffee[]
  deletedAt?: Date | null
  createdAt?: Date

  constructor(data: SubscriptionData) {
    Object.assign(this, data)
  }
}

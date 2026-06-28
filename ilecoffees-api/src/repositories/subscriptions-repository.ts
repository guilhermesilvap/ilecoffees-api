import { Subscription } from '@/entities/subscription'

export interface CreateSubscriptionDTO {
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  coffeeshopMonthlyPrice?: number | null
  coffeeshopAnnualPrice?: number | null
  quantity?: number | null
  supplierId: string
  coffeeIds: string[]
}

export interface UpdateSubscriptionDTO {
  name?: string
  description?: string
  monthlyPrice?: number
  annualPrice?: number
  coffeeshopMonthlyPrice?: number | null
  coffeeshopAnnualPrice?: number | null
  quantity?: number | null
  coffeeIds?: string[]
}

export interface ListSubscriptionsFilters {
  name?: string
  description?: string
  monthlyPrice?: number
  annualPrice?: number
  quantity?: number
  supplierId?: string
}

export interface SubscriptionsRepository {
  create(data: CreateSubscriptionDTO): Promise<Subscription>
  update(id: string, data: UpdateSubscriptionDTO): Promise<Subscription>
  softDelete(id: string): Promise<void>
  list(filters: ListSubscriptionsFilters): Promise<Subscription[]>
  findById(id: string, supplierId?: string): Promise<Subscription | null>
}

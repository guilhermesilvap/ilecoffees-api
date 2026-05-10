import { Subscription } from '@/entities/subscription'
import { SubscriptionsRepository, ListSubscriptionsFilters } from '@/repositories/subscriptions-repository'

export class ListSubscriptionsUseCase {
  constructor(private subscriptionsRepository: SubscriptionsRepository) {}

  async execute(filters: ListSubscriptionsFilters): Promise<Subscription[]> {
    return this.subscriptionsRepository.list(filters)
  }
}

import { AppError } from '@/utils/AppError'
import { Subscription } from '@/entities/subscription'
import { SubscriptionsRepository } from '@/repositories/subscriptions-repository'

export class GetSubscriptionUseCase {
  constructor(private subscriptionsRepository: SubscriptionsRepository) {}

  async execute(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionsRepository.findById(id)
    if (!subscription) throw new AppError('Plano não encontrado', 404)
    return subscription
  }
}

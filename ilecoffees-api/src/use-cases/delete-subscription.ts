import { AppError } from '@/utils/AppError'
import { SubscriptionsRepository } from '@/repositories/subscriptions-repository'

export class DeleteSubscriptionUseCase {
  constructor(private subscriptionsRepository: SubscriptionsRepository) {}

  async execute(id: string, supplierId?: string): Promise<void> {
    const existing = await this.subscriptionsRepository.findById(id, supplierId)
    if (!existing) throw new AppError('Assinatura não encontrada', 404)

    await this.subscriptionsRepository.softDelete(id)
  }
}

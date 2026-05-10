import { AppError } from '@/utils/AppError'
import { Order } from '@/entities/order'
import { SubscriptionsRepository } from '@/repositories/subscriptions-repository'
import { OrdersRepository } from '@/repositories/orders-repository'

interface CreateSubscriptionOrderInput {
  userId: string
  subscriptionId: string
  billingCycle: 'MONTHLY' | 'ANNUAL'
}

export class CreateSubscriptionOrderUseCase {
  constructor(
    private subscriptionsRepository: SubscriptionsRepository,
    private ordersRepository: OrdersRepository,
  ) {}

  async execute({ userId, subscriptionId, billingCycle }: CreateSubscriptionOrderInput): Promise<Order> {
    const subscription = await this.subscriptionsRepository.findById(subscriptionId)
    if (!subscription) throw new AppError('Assinatura não encontrada', 404)

    const existing = await this.ordersRepository.findActiveByUserAndSubscription(userId, subscriptionId)
    if (existing) throw new AppError('Você já possui uma assinatura ativa ou pendente de pagamento para este plano')

    const totalPrice = billingCycle === 'MONTHLY' ? subscription.monthlyPrice : subscription.annualPrice

    return this.ordersRepository.create({
      userId,
      subscriptionId,
      billingCycle,
      totalPrice,
      type: 'SUBSCRIPTION',
    })
  }
}

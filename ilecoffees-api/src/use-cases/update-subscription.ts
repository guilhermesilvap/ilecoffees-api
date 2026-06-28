import { AppError } from '@/utils/AppError'
import { Subscription } from '@/entities/subscription'
import { SubscriptionsRepository, UpdateSubscriptionDTO } from '@/repositories/subscriptions-repository'
import { CoffeesRepository } from '@/repositories/coffees-repository'

interface UpdateSubscriptionInput extends UpdateSubscriptionDTO {
  supplierId: string
}

export class UpdateSubscriptionUseCase {
  constructor(
    private subscriptionsRepository: SubscriptionsRepository,
    private coffeesRepository: CoffeesRepository,
  ) {}

  async execute(id: string, { supplierId, ...data }: UpdateSubscriptionInput): Promise<Subscription> {
    const existing = await this.subscriptionsRepository.findById(id, supplierId)
    if (!existing) throw new AppError('Assinatura não encontrada', 404)

    if (data.coffeeIds && data.coffeeIds.length > 0) {
      const coffees = await Promise.all(
        data.coffeeIds.map((coffeeId) => this.coffeesRepository.findById(coffeeId)),
      )

      const notFound = coffees.some((c) => !c || c.supplierId !== supplierId)
      if (notFound) {
        throw new AppError('Um ou mais cafés não foram encontrados ou não pertencem ao supplier')
      }

      const hasKgCoffee = coffees.some((c) => c!.saleType === 'KG')
      if (hasKgCoffee) {
        throw new AppError(
          'Cafés vendidos por KG não podem ser adicionados em assinaturas. Apenas cafés em pacotes são permitidos.',
        )
      }
    }

    return this.subscriptionsRepository.update(id, data)
  }
}

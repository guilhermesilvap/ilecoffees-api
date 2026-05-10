import { AppError } from '@/utils/AppError'
import { Subscription } from '@/entities/subscription'
import { SubscriptionsRepository, CreateSubscriptionDTO } from '@/repositories/subscriptions-repository'
import { CoffeesRepository } from '@/repositories/coffees-repository'

export class CreateSubscriptionUseCase {
  constructor(
    private subscriptionsRepository: SubscriptionsRepository,
    private coffeesRepository: CoffeesRepository,
  ) {}

  async execute(data: CreateSubscriptionDTO): Promise<Subscription> {
    const coffees = await Promise.all(
      data.coffeeIds.map((id) => this.coffeesRepository.findById(id)),
    )

    const notFound = coffees.some((c) => !c || c.supplierId !== data.supplierId)
    if (notFound) {
      throw new AppError('Um ou mais cafés não foram encontrados ou não pertencem ao supplier')
    }

    const hasKgCoffee = coffees.some((c) => c!.saleType === 'KG')
    if (hasKgCoffee) {
      throw new AppError(
        'Cafés vendidos por KG não podem ser adicionados em assinaturas. Apenas cafés em pacotes são permitidos.',
      )
    }

    return this.subscriptionsRepository.create(data)
  }
}

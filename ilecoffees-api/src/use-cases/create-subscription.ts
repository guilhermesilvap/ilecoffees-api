import { AppError } from '@/utils/AppError'
import { Subscription } from '@/entities/subscription'
import { SubscriptionsRepository, CreateSubscriptionDTO } from '@/repositories/subscriptions-repository'
import { CoffeesRepository } from '@/repositories/coffees-repository'
import { SuppliersRepository } from '@/repositories/suppliers-repository'

export class CreateSubscriptionUseCase {
  constructor(
    private subscriptionsRepository: SubscriptionsRepository,
    private coffeesRepository: CoffeesRepository,
    private suppliersRepository: SuppliersRepository,
  ) {}

  async execute(data: CreateSubscriptionDTO): Promise<Subscription> {
    const supplier = await this.suppliersRepository.findById(data.supplierId)
    if (!supplier) throw new AppError('Fornecedor não encontrado', 404)
    if (!supplier.isActive) throw new AppError('Sua conta está desativada. Entre em contato com o suporte.', 403)

    const coffees = await this.coffeesRepository.findManyByIds(data.coffeeIds)

    if (coffees.length !== data.coffeeIds.length) {
      throw new AppError('Um ou mais cafés não foram encontrados')
    }

    const notFound = coffees.some((c) => c.supplierId !== data.supplierId)
    if (notFound) {
      throw new AppError('Um ou mais cafés não pertencem ao fornecedor')
    }

    const hasKgCoffee = coffees.some((c) => c.saleType === 'KG')
    if (hasKgCoffee) {
      throw new AppError(
        'Cafés vendidos por KG não podem ser adicionados em assinaturas. Apenas cafés em pacotes são permitidos.',
      )
    }

    return this.subscriptionsRepository.create(data)
  }
}

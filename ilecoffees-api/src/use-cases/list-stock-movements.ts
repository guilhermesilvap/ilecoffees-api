import { AppError } from '@/utils/AppError'
import { CoffeesRepository } from '@/repositories/coffees-repository'
import { StockMovementsRepository } from '@/repositories/stock-movements-repository'

interface ListStockMovementsInput {
  supplierId: string
  coffeeId?: string
}

export class ListStockMovementsUseCase {
  constructor(
    private stockMovementsRepository: StockMovementsRepository,
    private coffeesRepository: CoffeesRepository,
  ) {}

  async execute({ supplierId, coffeeId }: ListStockMovementsInput) {
    if (coffeeId) {
      const coffee = await this.coffeesRepository.findById(coffeeId)
      if (!coffee || coffee.supplierId !== supplierId) {
        throw new AppError('Café não encontrado ou sem permissão', 403)
      }
      return this.stockMovementsRepository.listByCoffee(coffeeId)
    }
    return this.stockMovementsRepository.listBySupplier(supplierId)
  }
}

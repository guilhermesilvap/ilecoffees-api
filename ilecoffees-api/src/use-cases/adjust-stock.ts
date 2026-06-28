import { AppError } from '@/utils/AppError'
import { CoffeesRepository } from '@/repositories/coffees-repository'
import { StockMovementsRepository, StockMovementType } from '@/repositories/stock-movements-repository'

interface AdjustStockInput {
  coffeeId: string
  supplierId: string
  delta: number
  type: StockMovementType
  reason?: string
}

export class AdjustStockUseCase {
  constructor(
    private coffeesRepository: CoffeesRepository,
    private stockMovementsRepository: StockMovementsRepository,
  ) {}

  async execute({ coffeeId, supplierId, delta, type, reason }: AdjustStockInput) {
    const coffee = await this.coffeesRepository.findById(coffeeId)
    if (!coffee) throw new AppError('Café não encontrado', 404)
    if (coffee.supplierId !== supplierId) throw new AppError('Você não tem permissão para ajustar este estoque', 403)

    const currentStock = coffee.stock ?? 0
    const newStock = currentStock + delta

    if (newStock < 0) throw new AppError('Estoque não pode ser negativo', 400)

    const updated = await this.coffeesRepository.update(coffeeId, { stock: newStock })

    const movement = await this.stockMovementsRepository.create({
      coffeeId,
      type,
      delta,
      reason,
    })

    return { coffee: updated, movement }
  }
}

import { CoffeeshopStockRepository } from '@/repositories/coffeeshop-stock-repository'
import { NotifyLowStockUseCase } from './notify-low-stock'

export interface UpsertCoffeeshopStockInput {
  userId: string
  coffeeId: string
  quantity: number
  alertAt?: number | null
}

export class UpsertCoffeeshopStockUseCase {
  constructor(
    private repo: CoffeeshopStockRepository,
    private notifyUseCase?: NotifyLowStockUseCase,
  ) {}

  async execute(input: UpsertCoffeeshopStockInput) {
    const result = await this.repo.upsert(input)
    if (this.notifyUseCase && input.alertAt != null && result.quantity <= input.alertAt) {
      await this.notifyUseCase.execute(input.userId, input.coffeeId).catch(() => {})
    }
    return result
  }
}

import { CoffeeshopStockRepository } from '@/repositories/coffeeshop-stock-repository'

export class ListCoffeeshopStockUseCase {
  constructor(private repo: CoffeeshopStockRepository) {}

  async execute(userId: string) {
    return this.repo.listByUser(userId)
  }
}

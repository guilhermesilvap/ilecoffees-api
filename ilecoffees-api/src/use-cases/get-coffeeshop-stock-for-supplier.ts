import { CoffeeshopStockRepository, CoffeeshopStockForSupplierRow } from '@/repositories/coffeeshop-stock-repository'

export type { CoffeeshopStockForSupplierRow as CoffeeshopStockRow }

export class GetCoffeeshopStockForSupplierUseCase {
  constructor(private coffeeshopStockRepository: CoffeeshopStockRepository) {}

  async execute(supplierId: string): Promise<CoffeeshopStockForSupplierRow[]> {
    return this.coffeeshopStockRepository.listBySupplierId(supplierId)
  }
}

import { AppError } from '@/utils/AppError'
import { SuppliersRepository } from '@/repositories/suppliers-repository'
import { CoffeesRepository } from '@/repositories/coffees-repository'

export class DeleteSupplierUseCase {
  constructor(
    private suppliersRepository: SuppliersRepository,
    private coffeesRepository: CoffeesRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.suppliersRepository.findById(id)
    if (!existing) throw new AppError('Fornecedor não encontrado', 404)

    await this.coffeesRepository.softDeleteBySupplier(id)
    await this.suppliersRepository.softDelete(id)
  }
}

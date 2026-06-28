import { AppError } from '@/utils/AppError'
import { CoffeesRepository } from '@/repositories/coffees-repository'
import { SuppliersRepository } from '@/repositories/suppliers-repository'

export class DeleteCoffeeUseCase {
  constructor(
    private coffeesRepository: CoffeesRepository,
    private suppliersRepository: SuppliersRepository,
  ) {}

  async execute(id: string, requestingSupplierId?: string): Promise<void> {
    const existing = await this.coffeesRepository.findById(id)
    if (!existing) throw new AppError('Café inexistente', 404)

    if (requestingSupplierId) {
      if (existing.supplierId !== requestingSupplierId) {
        throw new AppError('Você não tem permissão para deletar este café', 403)
      }

      const supplier = await this.suppliersRepository.findById(requestingSupplierId)
      if (!supplier?.isActive) {
        throw new AppError('Fornecedor inativo não pode deletar cafés', 403)
      }
    }

    await this.coffeesRepository.softDelete(id)
  }
}

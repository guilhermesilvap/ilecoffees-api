import { AppError } from '@/utils/AppError'
import { Supplier } from '@/entities/supplier'
import { SuppliersRepository } from '@/repositories/suppliers-repository'

export class ToggleSupplierStatusUseCase {
  constructor(private suppliersRepository: SuppliersRepository) {}

  async execute(id: string, isActive: boolean): Promise<Supplier> {
    const existing = await this.suppliersRepository.findById(id)
    if (!existing) throw new AppError('Fornecedor não encontrado', 404)

    return this.suppliersRepository.toggleStatus(id, isActive)
  }
}

import { AppError } from '@/utils/AppError'
import { SuppliersRepository } from '@/repositories/suppliers-repository'

export class DeleteSupplierUseCase {
  constructor(private suppliersRepository: SuppliersRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.suppliersRepository.findById(id)
    if (!existing) throw new AppError('Supplier não encontrado', 404)

    await this.suppliersRepository.softDelete(id)
  }
}

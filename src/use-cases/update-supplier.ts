import { AppError } from '@/utils/AppError'
import { Supplier } from '@/entities/supplier'
import { SuppliersRepository, UpdateSupplierDTO } from '@/repositories/suppliers-repository'

export class UpdateSupplierUseCase {
  constructor(private suppliersRepository: SuppliersRepository) {}

  async execute(id: string, data: UpdateSupplierDTO): Promise<Supplier> {
    const existing = await this.suppliersRepository.findById(id)
    if (!existing) throw new AppError('Supplier não encontrado', 404)

    return this.suppliersRepository.update(id, data)
  }
}

import { AppError } from '@/utils/AppError'
import { SupplierPlansRepository } from '@/repositories/supplier-plans-repository'
import { SuppliersRepository } from '@/repositories/suppliers-repository'

export class DeleteSupplierPlanUseCase {
  constructor(
    private supplierPlansRepository: SupplierPlansRepository,
    private suppliersRepository: SuppliersRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.supplierPlansRepository.findById(id)
    if (!existing) throw new AppError('Plano não encontrado', 404)

    await this.suppliersRepository.clearPlanFromSuppliers(id)
    await this.supplierPlansRepository.softDelete(id)
  }
}

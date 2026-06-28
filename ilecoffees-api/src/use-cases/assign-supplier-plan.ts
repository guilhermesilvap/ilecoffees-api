import { AppError } from '@/utils/AppError'
import { Supplier } from '@/entities/supplier'
import { SuppliersRepository } from '@/repositories/suppliers-repository'
import { SupplierPlansRepository } from '@/repositories/supplier-plans-repository'

export class AssignSupplierPlanUseCase {
  constructor(
    private suppliersRepository: SuppliersRepository,
    private supplierPlansRepository: SupplierPlansRepository,
  ) {}

  async execute(supplierId: string, planId: string | null): Promise<Supplier> {
    const supplier = await this.suppliersRepository.findById(supplierId)
    if (!supplier) throw new AppError('Fornecedor não encontrado', 404)

    if (planId !== null) {
      const plan = await this.supplierPlansRepository.findById(planId)
      if (!plan) throw new AppError('Plano não encontrado', 404)
    }

    return this.suppliersRepository.assignPlan(supplierId, planId)
  }
}

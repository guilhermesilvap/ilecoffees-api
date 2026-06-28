import { AppError } from '@/utils/AppError'
import { SupplierPlan } from '@/entities/supplier-plan'
import { SupplierPlansRepository, UpdateSupplierPlanDTO } from '@/repositories/supplier-plans-repository'

export class UpdateSupplierPlanUseCase {
  constructor(private supplierPlansRepository: SupplierPlansRepository) {}

  async execute(id: string, data: UpdateSupplierPlanDTO): Promise<SupplierPlan> {
    const existing = await this.supplierPlansRepository.findById(id)
    if (!existing) throw new AppError('Plano não encontrado', 404)

    return this.supplierPlansRepository.update(id, data)
  }
}

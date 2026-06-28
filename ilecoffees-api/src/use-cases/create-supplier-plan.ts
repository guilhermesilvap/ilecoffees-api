import { SupplierPlan } from '@/entities/supplier-plan'
import { SupplierPlansRepository, CreateSupplierPlanDTO } from '@/repositories/supplier-plans-repository'

export class CreateSupplierPlanUseCase {
  constructor(private supplierPlansRepository: SupplierPlansRepository) {}

  async execute(data: CreateSupplierPlanDTO): Promise<SupplierPlan> {
    return this.supplierPlansRepository.create(data)
  }
}

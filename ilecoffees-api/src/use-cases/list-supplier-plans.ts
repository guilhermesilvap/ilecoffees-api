import { SupplierPlan } from '@/entities/supplier-plan'
import { SupplierPlansRepository } from '@/repositories/supplier-plans-repository'

export class ListSupplierPlansUseCase {
  constructor(private supplierPlansRepository: SupplierPlansRepository) {}

  async execute(): Promise<SupplierPlan[]> {
    return this.supplierPlansRepository.list()
  }
}

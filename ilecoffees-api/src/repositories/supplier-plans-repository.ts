import { SupplierPlan } from '@/entities/supplier-plan'

export interface CreateSupplierPlanDTO {
  name: string
  description: string
  price: number
  maxProducts?: number | null
}

export interface UpdateSupplierPlanDTO {
  name?: string
  description?: string
  price?: number
  maxProducts?: number | null
}

export interface SupplierPlansRepository {
  create(data: CreateSupplierPlanDTO): Promise<SupplierPlan>
  update(id: string, data: UpdateSupplierPlanDTO): Promise<SupplierPlan>
  softDelete(id: string): Promise<void>
  list(): Promise<SupplierPlan[]>
  findById(id: string): Promise<SupplierPlan | null>
}

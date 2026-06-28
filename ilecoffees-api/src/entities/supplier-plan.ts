export interface SupplierPlanData {
  id?: string
  name: string
  description: string
  price: number
  maxProducts?: number | null
  deletedAt?: Date | null
  createdAt?: Date
}

export class SupplierPlan {
  id?: string
  name!: string
  description!: string
  price!: number
  maxProducts?: number | null
  deletedAt?: Date | null
  createdAt?: Date

  constructor(data: SupplierPlanData) {
    Object.assign(this, data)
  }
}

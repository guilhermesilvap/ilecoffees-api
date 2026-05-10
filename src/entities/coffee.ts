export type SaleType = 'KG' | 'PACKAGE'

export interface CoffeeData {
  id?: string
  supplierId: string
  photoUrl?: string | null
  name: string
  description: string
  variety: string
  process: string
  region: string
  altitude: number
  farm: string
  producer: string
  score: number
  sensory: string
  roast: string
  saleType: SaleType
  pricePerKg?: number | null
  packagePrice?: number | null
  packageWeight?: number | null
  stock?: number | null
  deletedAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
}

export class Coffee {
  id?: string
  supplierId!: string
  photoUrl?: string | null
  name!: string
  description!: string
  variety!: string
  process!: string
  region!: string
  altitude!: number
  farm!: string
  producer!: string
  score!: number
  sensory!: string
  roast!: string
  saleType!: SaleType
  pricePerKg?: number | null
  packagePrice?: number | null
  packageWeight?: number | null
  stock?: number | null
  deletedAt?: Date | null
  createdAt?: Date
  updatedAt?: Date

  constructor(data: CoffeeData) {
    this.validate(data)
    Object.assign(this, data)
  }

  private validate(data: CoffeeData) {
    if (data.saleType === 'KG' && !data.pricePerKg) {
      throw new Error('Tipo de venda KG requer pricePerKg')
    }
    if (data.saleType === 'PACKAGE' && (!data.packagePrice || !data.packageWeight)) {
      throw new Error('Tipo de venda PACKAGE requer packagePrice e packageWeight')
    }
  }
}

import { AppError } from '@/utils/AppError'

export type SaleType = 'KG' | 'PACKAGE' | 'BOTH'
export type SupplierType = 'PRODUCER' | 'ROASTER'

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
  packagePriceCoffeeshop?: number | null
  packageWeight?: number | null
  stock?: number | null
  weightGrams?: number | null
  heightCm?: number | null
  widthCm?: number | null
  lengthCm?: number | null
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
  packagePriceCoffeeshop?: number | null
  packageWeight?: number | null
  stock?: number | null
  weightGrams?: number | null
  heightCm?: number | null
  widthCm?: number | null
  lengthCm?: number | null
  deletedAt?: Date | null
  createdAt?: Date
  updatedAt?: Date

  constructor(data: CoffeeData) {
    this.validate(data)
    Object.assign(this, data)
  }

  private validate(data: CoffeeData) {
    if (data.saleType === 'KG' && !data.pricePerKg) {
      throw new AppError('Tipo de venda KG requer pricePerKg')
    }
    if (data.saleType === 'PACKAGE' && (!data.packagePrice || !data.packageWeight)) {
      throw new AppError('Tipo de venda PACKAGE requer packagePrice e packageWeight')
    }
    if (data.saleType === 'BOTH') {
      if (!data.pricePerKg) throw new AppError('Tipo BOTH requer pricePerKg (kg para cafeteria)')
      if (!data.packageWeight) throw new AppError('Tipo BOTH requer packageWeight')
      if (!data.packagePrice && !data.packagePriceCoffeeshop) {
        throw new AppError('Tipo BOTH requer ao menos um preço de pacote')
      }
    }
  }
}

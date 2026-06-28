import { Coffee, SaleType, SupplierType } from '@/entities/coffee'

export interface CreateCoffeeDTO {
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
}

export interface UpdateCoffeeDTO {
  photoUrl?: string | null
  name?: string
  description?: string
  variety?: string
  process?: string
  region?: string
  altitude?: number
  farm?: string
  producer?: string
  score?: number
  sensory?: string
  roast?: string
  saleType?: SaleType
  pricePerKg?: number | null
  packagePrice?: number | null
  packagePriceCoffeeshop?: number | null
  packageWeight?: number | null
  stock?: number | null
  weightGrams?: number | null
  heightCm?: number | null
  widthCm?: number | null
  lengthCm?: number | null
}

export interface ListCoffeesFilters {
  name?: string
  description?: string
  variety?: string
  process?: string
  region?: string
  altitude?: number
  farm?: string
  producer?: string
  score?: number
  sensory?: string
  roast?: string
  saleType?: SaleType
  pricePerKg?: number
  packagePrice?: number
  packageWeight?: number
  stock?: number
  supplierId?: string
  supplierType?: SupplierType
}

export interface CoffeesRepository {
  create(data: CreateCoffeeDTO): Promise<Coffee>
  update(id: string, data: UpdateCoffeeDTO): Promise<Coffee>
  softDelete(id: string): Promise<void>
  softDeleteBySupplier(supplierId: string): Promise<void>
  list(filters: ListCoffeesFilters): Promise<Coffee[]>
  findById(id: string): Promise<Coffee | null>
  findManyByIds(ids: string[]): Promise<Coffee[]>
  decrementStock(id: string, quantity: number): Promise<void>
}

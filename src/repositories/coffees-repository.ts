import { Coffee, SaleType } from '@/entities/coffee'

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
  packageWeight?: number | null
  stock?: number | null
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
  packageWeight?: number | null
  stock?: number | null
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
}

export interface CoffeesRepository {
  create(data: CreateCoffeeDTO): Promise<Coffee>
  update(id: string, data: UpdateCoffeeDTO): Promise<Coffee>
  softDelete(id: string): Promise<void>
  list(filters: ListCoffeesFilters): Promise<Coffee[]>
  findById(id: string): Promise<Coffee | null>
  decrementStock(id: string, quantity: number): Promise<void>
}

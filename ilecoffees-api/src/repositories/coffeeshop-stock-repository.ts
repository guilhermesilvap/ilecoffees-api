import { CoffeeshopStock } from '@/entities/coffeeshop-stock'

export interface UpsertCoffeeshopStockDTO {
  userId: string
  coffeeId: string
  quantity: number
  alertAt?: number | null
}

export interface CoffeeshopStockForSupplierRow {
  coffeeshopId: string
  coffeeshopName: string
  coffeeshopEmail: string
  city: string | null
  state: string | null
  coffeeId: string
  coffeeName: string
  quantity: number
  alertAt: number | null
  isLow: boolean
  lastUpdated: Date
}

export interface CoffeeshopStockRepository {
  listByUser(userId: string): Promise<CoffeeshopStock[]>
  findByUserAndCoffee(userId: string, coffeeId: string): Promise<CoffeeshopStock | null>
  upsert(data: UpsertCoffeeshopStockDTO): Promise<CoffeeshopStock>
  addQuantity(userId: string, coffeeId: string, amount: number): Promise<void>
  listBySupplierId(supplierId: string): Promise<CoffeeshopStockForSupplierRow[]>
}

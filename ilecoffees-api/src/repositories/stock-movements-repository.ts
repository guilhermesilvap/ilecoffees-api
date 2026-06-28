export type StockMovementType = 'ENTRY' | 'SALE' | 'ADJUSTMENT'

export interface StockMovement {
  id: string
  coffeeId: string
  type: StockMovementType
  delta: number
  reason?: string | null
  orderId?: string | null
  createdAt: Date
  coffee?: { name: string; supplierId: string }
}

export interface CreateStockMovementDTO {
  coffeeId: string
  type: StockMovementType
  delta: number
  reason?: string
  orderId?: string
}

export interface StockMovementsRepository {
  create(data: CreateStockMovementDTO): Promise<StockMovement>
  listByCoffee(coffeeId: string): Promise<StockMovement[]>
  listBySupplier(supplierId: string): Promise<StockMovement[]>
}

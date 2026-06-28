export interface CoffeeshopStockData {
  id?: string
  userId: string
  coffeeId: string
  quantity: number
  alertAt?: number | null
  updatedAt?: Date
  createdAt?: Date
  coffee?: {
    id: string
    name: string
    photoUrl?: string | null
    saleType: string
    pricePerKg?: number | null
    packagePriceCoffeeshop?: number | null
    supplier?: { id: string; name: string }
  }
}

export class CoffeeshopStock {
  id?: string
  userId!: string
  coffeeId!: string
  quantity!: number
  alertAt?: number | null
  updatedAt?: Date
  createdAt?: Date
  coffee?: CoffeeshopStockData['coffee']

  constructor(data: CoffeeshopStockData) {
    Object.assign(this, data)
  }
}

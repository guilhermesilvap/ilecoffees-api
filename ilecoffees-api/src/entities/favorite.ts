export interface FavoriteData {
  id?: string
  userId: string
  coffeeId: string
  createdAt?: Date
  coffee?: {
    id: string
    name: string
    photoUrl?: string | null
    packagePrice?: number | null
    packagePriceCoffeeshop?: number | null
    pricePerKg?: number | null
    saleType: string
    supplierId: string
  } | null
}

export class Favorite {
  id?: string
  userId!: string
  coffeeId!: string
  createdAt?: Date
  coffee?: FavoriteData['coffee']

  constructor(data: FavoriteData) {
    Object.assign(this, data)
  }
}

export interface CartItemCoffeeSnapshot {
  id: string
  name: string
  photoUrl: string | null
  saleType: string
  pricePerKg: number | null
  packagePrice: number | null
  packageWeight: number | null
}

export interface CartItemData {
  id?: string
  userId: string
  coffeeId: string
  quantity: number
  addedAt?: Date
  coffee?: CartItemCoffeeSnapshot
}

export class CartItem {
  id?: string
  userId!: string
  coffeeId!: string
  quantity!: number
  addedAt?: Date
  coffee?: CartItemCoffeeSnapshot

  constructor(data: CartItemData) {
    Object.assign(this, data)
  }
}

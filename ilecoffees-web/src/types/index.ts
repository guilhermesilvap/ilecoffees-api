export interface Coffee {
  id: string
  name: string
  description: string | null
  variety?: string
  process?: string
  region: string | null
  altitude?: number
  farm?: string
  producer?: string
  saleType: 'KG' | 'PACKAGE' | 'BOTH'
  pricePerKg: number | null
  packagePrice: number | null
  packagePriceCoffeeshop: number | null
  packageWeight?: number | null
  score: number | null
  sensory?: string
  roast?: string
  stock?: number | null
  photoUrl: string | null
  supplierId?: string
  weightGrams?: number | null
  heightCm?: number | null
  widthCm?: number | null
  lengthCm?: number | null
}

export interface Subscription {
  id: string
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  coffeeshopMonthlyPrice?: number | null
  coffeeshopAnnualPrice?: number | null
  quantity?: number | null
  supplierId: string
  coffees: Coffee[]
}

export interface Order {
  id: string
  status: string
  totalPrice: number
  createdAt: string
  quantity?: number | null
  coffeeId?: string | null
  courseId?: string | null
  subscriptionId?: string | null
  type?: string
  user?: { name: string }
  supplier?: { name: string }
  coffee?: { name: string }
}

export interface StockMovement {
  id: string
  coffeeId: string
  type: 'ENTRY' | 'SALE' | 'ADJUSTMENT'
  delta: number
  reason?: string | null
  orderId?: string | null
  createdAt: string
  coffee?: { name: string }
}

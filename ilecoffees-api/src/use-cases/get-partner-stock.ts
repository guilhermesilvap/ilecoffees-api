import { PartnerStockRepository } from '@/repositories/partner-stock-repository'

export interface SupplierStockItem {
  supplierId: string
  supplierName: string
  supplierType: string
  coffeeCount: number
  coffees: {
    id: string
    name: string
    stock: number | null
    pricePerKg: number | null
    packagePrice: number | null
    region: string
    isActive: boolean
  }[]
}

export interface CoffeeshopStockItem {
  userId: string
  userName: string
  userEmail: string
  city: string | null
  state: string | null
  stockCount: number
  stocks: {
    coffeeId: string
    coffeeName: string
    supplierName: string
    quantity: number
    alertAt: number | null
    isLow: boolean
  }[]
}

export interface PartnerStockResult {
  suppliers: SupplierStockItem[]
  coffeeshops: CoffeeshopStockItem[]
}

export class GetPartnerStockUseCase {
  constructor(private partnerStockRepository: PartnerStockRepository) {}

  async execute(): Promise<PartnerStockResult> {
    return this.partnerStockRepository.getAll()
  }
}

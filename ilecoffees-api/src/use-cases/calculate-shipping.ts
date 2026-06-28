import { AppError } from '@/utils/AppError'
import { ShippingOption, ShippingService } from '@/repositories/shipping-service'
import { CartItemsRepository } from '@/repositories/cart-items-repository'
import { CoffeesRepository } from '@/repositories/coffees-repository'
import { SuppliersRepository } from '@/repositories/suppliers-repository'

export interface ShippingGroup {
  supplierId: string
  supplierName: string
  options: ShippingOption[]
}

export class CalculateShippingUseCase {
  constructor(
    private cartItemsRepository: CartItemsRepository,
    private coffeesRepository: CoffeesRepository,
    private suppliersRepository: SuppliersRepository,
    private shippingService: ShippingService,
  ) {}

  async execute(userId: string, destinationCep: string): Promise<ShippingGroup[]> {
    const cartItems = await this.cartItemsRepository.listByBuyer({ userId })
    if (cartItems.length === 0) throw new AppError('Carrinho está vazio')

    const coffeeCache = new Map<string, Awaited<ReturnType<typeof this.coffeesRepository.findById>>>()
    const supplierGroups = new Map<string, { coffeeId: string; quantity: number }[]>()

    for (const item of cartItems) {
      let coffee = coffeeCache.get(item.coffeeId)
      if (!coffee) {
        coffee = await this.coffeesRepository.findById(item.coffeeId)
        if (!coffee) continue
        coffeeCache.set(item.coffeeId, coffee)
      }

      const existing = supplierGroups.get(coffee.supplierId)
      if (existing) {
        existing.push({ coffeeId: item.coffeeId, quantity: item.quantity })
      } else {
        supplierGroups.set(coffee.supplierId, [{ coffeeId: item.coffeeId, quantity: item.quantity }])
      }
    }

    const groups: ShippingGroup[] = []

    for (const [supplierId, products] of supplierGroups.entries()) {
      const supplier = await this.suppliersRepository.findById(supplierId)
      if (!supplier) continue

      const shippingProducts = products.map(({ coffeeId, quantity }) => {
        const coffee = coffeeCache.get(coffeeId)
        return {
          weightGrams: coffee?.weightGrams ?? 500,
          heightCm: coffee?.heightCm ?? 10,
          widthCm: coffee?.widthCm ?? 15,
          lengthCm: coffee?.lengthCm ?? 20,
          quantity,
        }
      })

      const options = await this.shippingService.calculate({
        originCep: supplier.cep,
        destinationCep,
        products: shippingProducts,
      })

      groups.push({ supplierId, supplierName: supplier.name, options: options.slice(0, 5) })
    }

    return groups
  }
}

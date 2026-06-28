import { AppError } from '@/utils/AppError'
import { CartItem } from '@/entities/cart-item'
import { CartItemsRepository } from '@/repositories/cart-items-repository'
import { CoffeesRepository } from '@/repositories/coffees-repository'

interface AddToCartInput {
  userId?: string
  supplierId?: string
  coffeeId: string
  quantity: number
  accountType?: 'CUSTOMER' | 'COFFEESHOP'
}

export class AddToCartUseCase {
  constructor(
    private cartItemsRepository: CartItemsRepository,
    private coffeesRepository: CoffeesRepository,
  ) {}

  async execute({ userId, supplierId, coffeeId, quantity, accountType }: AddToCartInput): Promise<CartItem> {
    if (quantity <= 0) throw new AppError('A quantidade deve ser maior que zero')

    const coffee = await this.coffeesRepository.findById(coffeeId)
    if (!coffee) throw new AppError('Café não encontrado', 404)

    if (accountType === 'CUSTOMER' && coffee.saleType === 'KG') {
      throw new AppError(
        'Clientes finais só podem comprar pacotes fechados. Cafés vendidos por kg são exclusivos para cafeterias.',
        403,
      )
    }

    if (coffee.stock !== null && coffee.stock !== undefined) {
      if (coffee.stock <= 0) throw new AppError('Café sem estoque disponível')
      if (coffee.stock < quantity) throw new AppError(`Estoque insuficiente. Disponível: ${coffee.stock}`)
    }

    const buyer = supplierId ? { supplierId } : { userId: userId! }
    return this.cartItemsRepository.addOrUpdate({ ...buyer, coffeeId, quantity })
  }
}

import { AppError } from '@/utils/AppError'
import { CartItem } from '@/entities/cart-item'
import { CartItemsRepository, BuyerRef } from '@/repositories/cart-items-repository'
import { CoffeesRepository } from '@/repositories/coffees-repository'

interface UpdateCartItemInput {
  buyer: BuyerRef
  coffeeId: string
  quantity: number
}

export class UpdateCartItemUseCase {
  constructor(
    private cartItemsRepository: CartItemsRepository,
    private coffeesRepository: CoffeesRepository,
  ) {}

  async execute({ buyer, coffeeId, quantity }: UpdateCartItemInput): Promise<CartItem> {
    if (quantity <= 0) throw new AppError('A quantidade deve ser maior que zero')

    const item = await this.cartItemsRepository.findItem(buyer, coffeeId)
    if (!item) throw new AppError('Item não encontrado no carrinho', 404)

    const coffee = await this.coffeesRepository.findById(coffeeId)
    if (!coffee) throw new AppError('Café não encontrado', 404)

    if (coffee.stock !== null && coffee.stock !== undefined && coffee.stock < quantity) {
      throw new AppError(`Estoque insuficiente. Disponível: ${coffee.stock}`)
    }

    return this.cartItemsRepository.addOrUpdate({ ...buyer, coffeeId, quantity })
  }
}

import { AppError } from '@/utils/AppError'
import { CartItemsRepository } from '@/repositories/cart-items-repository'

export class RemoveFromCartUseCase {
  constructor(private cartItemsRepository: CartItemsRepository) {}

  async execute(userId: string, coffeeId: string): Promise<void> {
    const item = await this.cartItemsRepository.findItem(userId, coffeeId)
    if (!item) throw new AppError('Item não encontrado no carrinho', 404)

    await this.cartItemsRepository.remove(userId, coffeeId)
  }
}

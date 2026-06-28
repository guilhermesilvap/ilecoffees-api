import { AppError } from '@/utils/AppError'
import { CartItemsRepository, BuyerRef } from '@/repositories/cart-items-repository'

export class RemoveFromCartUseCase {
  constructor(private cartItemsRepository: CartItemsRepository) {}

  async execute(buyer: BuyerRef, coffeeId: string): Promise<void> {
    const item = await this.cartItemsRepository.findItem(buyer, coffeeId)
    if (!item) throw new AppError('Item não encontrado no carrinho', 404)

    await this.cartItemsRepository.remove(buyer, coffeeId)
  }
}

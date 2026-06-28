import { CartItem } from '@/entities/cart-item'
import { CartItemsRepository, BuyerRef } from '@/repositories/cart-items-repository'

export class ListCartUseCase {
  constructor(private cartItemsRepository: CartItemsRepository) {}

  async execute(buyer: BuyerRef): Promise<CartItem[]> {
    return this.cartItemsRepository.listByBuyer(buyer)
  }
}

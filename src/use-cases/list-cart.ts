import { CartItem } from '@/entities/cart-item'
import { CartItemsRepository } from '@/repositories/cart-items-repository'

export class ListCartUseCase {
  constructor(private cartItemsRepository: CartItemsRepository) {}

  async execute(userId: string): Promise<CartItem[]> {
    return this.cartItemsRepository.listByUser(userId)
  }
}

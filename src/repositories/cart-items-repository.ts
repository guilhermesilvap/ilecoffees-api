import { CartItem } from '@/entities/cart-item'

export interface AddCartItemDTO {
  userId: string
  coffeeId: string
  quantity: number
}

export interface CartItemsRepository {
  addOrUpdate(data: AddCartItemDTO): Promise<CartItem>
  remove(userId: string, coffeeId: string): Promise<void>
  listByUser(userId: string): Promise<CartItem[]>
  clearCart(userId: string): Promise<void>
  findItem(userId: string, coffeeId: string): Promise<CartItem | null>
}

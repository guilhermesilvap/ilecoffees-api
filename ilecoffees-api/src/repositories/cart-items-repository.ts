import { CartItem } from '@/entities/cart-item'

export interface BuyerRef {
  userId?: string
  supplierId?: string
}

export interface AddCartItemDTO {
  userId?: string
  supplierId?: string
  coffeeId: string
  quantity: number
}

export interface CartItemsRepository {
  addOrUpdate(data: AddCartItemDTO): Promise<CartItem>
  remove(buyer: BuyerRef, coffeeId: string): Promise<void>
  listByBuyer(buyer: BuyerRef): Promise<CartItem[]>
  clearCart(buyer: BuyerRef): Promise<void>
  findItem(buyer: BuyerRef, coffeeId: string): Promise<CartItem | null>
}

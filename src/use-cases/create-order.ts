import { AppError } from '@/utils/AppError'
import { Order } from '@/entities/order'
import { CartItemsRepository } from '@/repositories/cart-items-repository'
import { CoffeesRepository } from '@/repositories/coffees-repository'
import { OrdersRepository } from '@/repositories/orders-repository'

export class CreateOrderUseCase {
  constructor(
    private cartItemsRepository: CartItemsRepository,
    private coffeesRepository: CoffeesRepository,
    private ordersRepository: OrdersRepository,
  ) {}

  async execute(userId: string): Promise<Order[]> {
    const cartItems = await this.cartItemsRepository.listByUser(userId)

    if (cartItems.length === 0) throw new AppError('Carrinho está vazio')

    const orders: Order[] = []

    for (const item of cartItems) {
      const coffee = await this.coffeesRepository.findById(item.coffeeId)
      if (!coffee) throw new AppError(`Café ${item.coffeeId} não encontrado ou indisponível`, 404)

      if (coffee.stock !== null && coffee.stock !== undefined && coffee.stock < item.quantity) {
        throw new AppError(`Estoque insuficiente para o café "${coffee.name}". Disponível: ${coffee.stock}`)
      }

      const pricePerUnit =
        coffee.saleType === 'KG'
          ? (coffee.pricePerKg ?? 0)
          : (coffee.packagePrice ?? 0)

      const totalPrice = pricePerUnit * item.quantity

      const order = await this.ordersRepository.create({
        userId,
        coffeeId: coffee.id,
        quantity: item.quantity,
        totalPrice,
        type: 'ONE_TIME',
      })

      orders.push(order)
    }

    await this.cartItemsRepository.clearCart(userId)

    return orders
  }
}

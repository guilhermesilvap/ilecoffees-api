import { AppError } from '@/utils/AppError'
import { Order } from '@/entities/order'
import { CartItemsRepository } from '@/repositories/cart-items-repository'
import { CoffeesRepository } from '@/repositories/coffees-repository'
import { OrdersRepository } from '@/repositories/orders-repository'
import { UsersRepository } from '@/repositories/users-repository'
import { NotificationService } from '@/services/notification-service'

export interface ShippingChoice {
  supplierId: string
  carrier: string
  shippingCost: number
  deadlineDays: number
}

interface CreateOrderInput {
  userId: string
  deliveryCep?: string
  shippingChoices?: ShippingChoice[]
}

export class CreateOrderUseCase {
  constructor(
    private cartItemsRepository: CartItemsRepository,
    private coffeesRepository: CoffeesRepository,
    private ordersRepository: OrdersRepository,
    private usersRepository: UsersRepository,
    private notificationService: NotificationService,
  ) {}

  async execute({ userId, deliveryCep, shippingChoices }: CreateOrderInput): Promise<Order[]> {
    const [cartItems, user] = await Promise.all([
      this.cartItemsRepository.listByBuyer({ userId }),
      this.usersRepository.findById(userId),
    ])

    if (cartItems.length === 0) throw new AppError('Carrinho está vazio')
    if (!user) throw new AppError('Usuário não encontrado', 404)
    if (!deliveryCep) throw new AppError('CEP de entrega é obrigatório')

    const orderDataList: Parameters<typeof this.ordersRepository.create>[0][] = []

    for (const item of cartItems) {
      const coffee = await this.coffeesRepository.findById(item.coffeeId)
      if (!coffee) throw new AppError(`Café ${item.coffeeId} não encontrado ou indisponível`, 404)

      if (user.accountType === 'CUSTOMER' && coffee.saleType === 'KG') {
        throw new AppError(
          `O café "${coffee.name}" é vendido por kg e não está disponível para clientes finais.`,
          403,
        )
      }

      if (coffee.stock !== null && coffee.stock !== undefined && coffee.stock < item.quantity) {
        throw new AppError(`Estoque insuficiente para o café "${coffee.name}". Disponível: ${coffee.stock}`)
      }

      const isCoffeeshop = user.accountType === 'COFFEESHOP'
      const pricePerUnit =
        coffee.saleType === 'KG'
          ? (coffee.pricePerKg ?? 0)
          : (isCoffeeshop && coffee.packagePriceCoffeeshop != null
              ? coffee.packagePriceCoffeeshop
              : (coffee.packagePrice ?? 0))

      const shippingChoice = shippingChoices?.find((s) => s.supplierId === coffee.supplierId)

      orderDataList.push({
        userId,
        coffeeId: coffee.id,
        quantity: item.quantity,
        totalPrice: pricePerUnit * item.quantity,
        shippingCost: shippingChoice?.shippingCost ?? null,
        deliveryCep: deliveryCep ?? null,
        shippingCarrier: shippingChoice?.carrier ?? null,
        shippingDeadlineDays: shippingChoice?.deadlineDays ?? null,
        type: 'ONE_TIME',
      })
    }

    const orders = await this.ordersRepository.createBatch(orderDataList)

    // Notifica por e-mail para cada pedido criado
    for (const order of orders) {
      this.notificationService.notify(
        { id: user.id!, name: user.name, email: user.email, phoneNumber: user.phoneNumber },
        {
          type: 'PURCHASE',
          title: 'Pedido realizado com sucesso!',
          body: `Seu pedido #${order.id!.slice(0, 8)} foi criado. Aguarde a confirmação do pagamento.`,
          data: { orderId: order.id },
        },
        { userId: user.id },
      ).catch(() => {})
    }

    return orders
  }
}

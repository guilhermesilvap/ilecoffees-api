import { AppError } from '@/utils/AppError'
import { Order } from '@/entities/order'
import { CartItemsRepository } from '@/repositories/cart-items-repository'
import { CoffeesRepository } from '@/repositories/coffees-repository'
import { OrdersRepository } from '@/repositories/orders-repository'
import { SuppliersRepository } from '@/repositories/suppliers-repository'
import { ShippingChoice } from './create-order'

interface CreateB2BOrderInput {
  supplierId: string
  deliveryCep: string
  shippingChoices?: ShippingChoice[]
}

export class CreateB2BOrderUseCase {
  constructor(
    private cartItemsRepository: CartItemsRepository,
    private coffeesRepository: CoffeesRepository,
    private ordersRepository: OrdersRepository,
    private suppliersRepository: SuppliersRepository,
  ) {}

  async execute({ supplierId, deliveryCep, shippingChoices }: CreateB2BOrderInput): Promise<Order[]> {
    const [cartItems, buyer] = await Promise.all([
      this.cartItemsRepository.listByBuyer({ supplierId }),
      this.suppliersRepository.findById(supplierId),
    ])

    if (!buyer) throw new AppError('Fornecedor não encontrado', 404)
    if (buyer.supplierType !== 'ROASTER') {
      throw new AppError('Apenas torrefadores podem realizar compras B2B', 403)
    }
    if (cartItems.length === 0) throw new AppError('Carrinho está vazio')

    const orderDataList: Parameters<typeof this.ordersRepository.create>[0][] = []

    for (const item of cartItems) {
      const coffee = await this.coffeesRepository.findById(item.coffeeId)
      if (!coffee) throw new AppError(`Café ${item.coffeeId} não encontrado ou indisponível`, 404)

      // ROASTER só pode comprar de PRODUCER
      if ((coffee as any).supplier?.supplierType !== 'PRODUCER') {
        throw new AppError(
          `O café "${coffee.name}" não é de um produtor. Torrefadores só podem comprar café verde de produtores.`,
          403,
        )
      }

      // ROASTER compra sempre por KG
      if (coffee.saleType === 'PACKAGE') {
        throw new AppError(
          `O café "${coffee.name}" só é vendido em pacote e não está disponível para compra B2B.`,
          403,
        )
      }

      if (coffee.stock !== null && coffee.stock !== undefined && coffee.stock < item.quantity) {
        throw new AppError(`Estoque insuficiente para o café "${coffee.name}". Disponível: ${coffee.stock}`)
      }

      const shippingChoice = shippingChoices?.find((s) => s.supplierId === coffee.supplierId)

      orderDataList.push({
        buyerSupplierId: supplierId,
        coffeeId: coffee.id,
        quantity: item.quantity,
        totalPrice: (coffee.pricePerKg ?? 0) * item.quantity,
        shippingCost: shippingChoice?.shippingCost ?? null,
        deliveryCep,
        shippingCarrier: shippingChoice?.carrier ?? null,
        shippingDeadlineDays: shippingChoice?.deadlineDays ?? null,
        type: 'ONE_TIME',
      })
    }

    return this.ordersRepository.createBatch(orderDataList)
  }
}

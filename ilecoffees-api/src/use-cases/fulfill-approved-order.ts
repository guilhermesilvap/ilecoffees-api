import { Order } from '@/entities/order'
import { CoffeesRepository } from '@/repositories/coffees-repository'
import { CourseEnrollmentsRepository } from '@/repositories/course-enrollments-repository'
import { CartItemsRepository } from '@/repositories/cart-items-repository'
import { StockMovementsRepository } from '@/repositories/stock-movements-repository'
import { CoffeeshopStockRepository } from '@/repositories/coffeeshop-stock-repository'
import { SubscriptionsRepository } from '@/repositories/subscriptions-repository'
import { SubscriptionDeliveriesRepository } from '@/repositories/subscription-deliveries-repository'
import { NotificationService } from '@/services/notification-service'

export class FulfillApprovedOrderUseCase {
  constructor(
    private coffeesRepository: CoffeesRepository,
    private courseEnrollmentsRepository: CourseEnrollmentsRepository,
    private cartItemsRepository: CartItemsRepository,
    private stockMovementsRepository: StockMovementsRepository,
    private notificationService: NotificationService,
    private coffeeshopStockRepository?: CoffeeshopStockRepository,
    private subscriptionsRepository?: SubscriptionsRepository,
    private subscriptionDeliveriesRepository?: SubscriptionDeliveriesRepository,
  ) {}

  async execute(order: Order): Promise<void> {
    const orderId = order.id!
    const isB2B = !!order.buyerSupplierId && !order.userId
    let supplierId: string | null = null

    if (order.type === 'ONE_TIME' && order.coffeeId && order.quantity) {
      const coffee = await this.coffeesRepository.findById(order.coffeeId)
      if (coffee) {
        supplierId = coffee.supplierId
        if (coffee.stock != null) {
          await this.coffeesRepository.decrementStock(order.coffeeId, order.quantity)
          await this.stockMovementsRepository.create({
            coffeeId: order.coffeeId,
            type: 'SALE',
            delta: -order.quantity,
            reason: `Pedido #${orderId.slice(0, 8)}`,
            orderId,
          })
        }
        // Coffeeshop stock only applies to USER (COFFEESHOP) buyers, not B2B ROASTER
        if (!isB2B && this.coffeeshopStockRepository && order.userId) {
          await this.coffeeshopStockRepository.addQuantity(order.userId, order.coffeeId, order.quantity).catch(() => {})
        }
      }
    }

    // Subscription delivery records — one per coffee in the plan
    if (order.type === 'SUBSCRIPTION' && order.subscriptionId) {
      const subscription = await this.subscriptionsRepository?.findById(order.subscriptionId)
      if (subscription?.coffees?.length) {
        const totalQty = subscription.quantity ?? 1
        const perCoffee = Math.max(1, Math.round(totalQty / subscription.coffees.length))
        for (const coffee of subscription.coffees) {
          await this.subscriptionDeliveriesRepository?.create({
            orderId,
            coffeeId: coffee.id!,
            quantity: perCoffee,
          }).catch(() => {})
        }
      }
    }

    // Course enrollment only for USER buyers
    if (!isB2B && order.type === 'COURSE' && order.courseId && order.userId) {
      await this.courseEnrollmentsRepository.create({ userId: order.userId, courseId: order.courseId }).catch((e: any) => {
        if (e?.code !== 'P2002') throw e
      })
    }

    // Clear cart — user cart or supplier cart
    if (order.userId) {
      await this.cartItemsRepository.clearCart({ userId: order.userId })
    } else if (order.buyerSupplierId) {
      await this.cartItemsRepository.clearCart({ supplierId: order.buyerSupplierId })
    }

    // Notify buyer
    if (order.user) {
      await this.notificationService.notify(
        { id: order.user.id, name: order.user.name, email: order.user.email, phoneNumber: order.user.phoneNumber },
        { type: 'PURCHASE', title: 'Pagamento confirmado', body: `Seu pedido #${orderId.slice(0, 8)} foi pago com sucesso.`, data: { orderId } },
        { userId: order.user.id },
      ).catch(() => {})
    } else if (order.buyerSupplier) {
      await this.notificationService.notify(
        { id: order.buyerSupplier.id, name: order.buyerSupplier.name, email: order.buyerSupplier.email },
        { type: 'PURCHASE', title: 'Compra B2B confirmada', body: `Seu pedido #${orderId.slice(0, 8)} foi pago com sucesso.`, data: { orderId } },
        { supplierId: order.buyerSupplier.id },
      ).catch(() => {})
    }

    // Notify seller
    if (supplierId) {
      await this.notificationService.notify(
        { id: supplierId, name: '' },
        { type: 'NEW_ORDER', title: 'Novo pedido recebido', body: `Pedido #${orderId.slice(0, 8)} pago — aguardando envio.`, data: { orderId } },
        { supplierId },
      ).catch(() => {})
    }
  }
}

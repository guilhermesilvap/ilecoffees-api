import { AppError } from '@/utils/AppError'
import { Order, OrderStatus } from '@/entities/order'
import { OrdersRepository } from '@/repositories/orders-repository'
import { NotificationService } from '@/services/notification-service'

interface UpdateOrderStatusInput {
  id: string
  status: OrderStatus
  trackingCode?: string | null
}

const statusLabel: Record<string, string> = {
  SHIPPED: 'enviado',
  DELIVERED: 'entregue',
  CANCELED: 'cancelado',
  PAID: 'pago',
}

export class UpdateOrderStatusUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private notificationService: NotificationService,
  ) {}

  async execute({ id, status, trackingCode }: UpdateOrderStatusInput): Promise<Order> {
    const order = await this.ordersRepository.findById(id)
    if (!order) throw new AppError('Pedido não encontrado', 404)

    const updated = await this.ordersRepository.updateStatus(id, status, trackingCode)

    if (order.user) {
      const label = statusLabel[status] ?? status.toLowerCase()
      await this.notificationService.notify(
        {
          id: order.user.id,
          name: order.user.name,
          email: order.user.email,
          phoneNumber: order.user.phoneNumber,
        },
        {
          type: 'ORDER_STATUS',
          title: 'Status do pedido atualizado',
          body: `Seu pedido #${id.slice(0, 8)} foi marcado como ${label}.`,
          data: { orderId: id, status },
        },
        { userId: order.user.id },
      ).catch(() => {})
    }

    return updated
  }
}

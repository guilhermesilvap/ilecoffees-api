import { AppError } from '@/utils/AppError'
import { OrdersRepository } from '@/repositories/orders-repository'

export interface TrackOrderResult {
  id: string
  status: string
  type: string
  totalPrice: number
  quantity: number | null | undefined
  trackingCode: string | null | undefined
  shippingCost: number | null | undefined
  shippingCarrier: string | null | undefined
  shippingDeadlineDays: number | null | undefined
  deliveryCep: string | null | undefined
  createdAt: Date | undefined
  updatedAt: Date | undefined
  coffee: { id: string; name: string; photoUrl: string | null; saleType: string } | null
  course: { id: string; title: string; imageUrl: string | null } | null
  subscription: { id: string; name: string } | null
  payment: { status: string; method: string | null; paidAt: Date | null; amount: number } | null
}

export class TrackOrderUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute(orderId: string): Promise<TrackOrderResult> {
    const order = await this.ordersRepository.findById(orderId)
    if (!order) throw new AppError('Pedido não encontrado', 404)

    const o = order as any

    return {
      id: order.id!,
      status: order.status,
      type: order.type,
      totalPrice: order.totalPrice,
      quantity: order.quantity,
      trackingCode: order.trackingCode,
      shippingCost: order.shippingCost,
      shippingCarrier: order.shippingCarrier,
      shippingDeadlineDays: order.shippingDeadlineDays,
      deliveryCep: order.deliveryCep,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      coffee: o.coffee ?? null,
      course: o.course ?? null,
      subscription: o.subscription ?? null,
      payment: o.payment ?? null,
    }
  }
}

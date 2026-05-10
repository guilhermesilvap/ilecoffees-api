import { AppError } from '@/utils/AppError'
import { Payment, PaymentMethod } from '@/entities/payment'
import { PaymentsRepository } from '@/repositories/payments-repository'
import { OrdersRepository } from '@/repositories/orders-repository'
import { CoffeesRepository } from '@/repositories/coffees-repository'
import { CourseEnrollmentsRepository } from '@/repositories/course-enrollments-repository'

interface CreatePaymentInput {
  orderId: string
  method: PaymentMethod
  userId: string
}

export class CreatePaymentUseCase {
  constructor(
    private paymentsRepository: PaymentsRepository,
    private ordersRepository: OrdersRepository,
    private coffeesRepository: CoffeesRepository,
    private courseEnrollmentsRepository: CourseEnrollmentsRepository,
  ) {}

  async execute({ orderId, method, userId }: CreatePaymentInput): Promise<Payment> {
    const order = await this.ordersRepository.findById(orderId)
    if (!order) throw new AppError('Pedido não encontrado', 404)
    if (order.userId !== userId) throw new AppError('Você não tem permissão para pagar este pedido', 403)
    if (order.status !== 'PENDING') throw new AppError('Este pedido já foi processado')

    const existingPayment = await this.paymentsRepository.findByOrderId(orderId)
    if (existingPayment) throw new AppError('Este pedido já possui um pagamento registrado')

    const payment = await this.paymentsRepository.create({
      orderId,
      amount: order.totalPrice,
      method,
      status: 'SUCCESS',
      paidAt: new Date(),
    })

    await this.ordersRepository.updateStatus(orderId, 'PAID')

    if (order.type === 'ONE_TIME' && order.coffeeId && order.quantity) {
      const coffee = await this.coffeesRepository.findById(order.coffeeId)
      if (coffee && coffee.stock != null) {
        await this.coffeesRepository.decrementStock(order.coffeeId, order.quantity)
      }
    }

    if (order.type === 'COURSE' && order.courseId) {
      await this.courseEnrollmentsRepository.create({ userId, courseId: order.courseId })
    }

    return payment
  }
}

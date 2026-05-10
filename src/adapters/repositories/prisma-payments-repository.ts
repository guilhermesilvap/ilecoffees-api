import { PrismaClient } from '@prisma/client'
import { Payment, PaymentData } from '@/entities/payment'
import { PaymentsRepository, CreatePaymentDTO } from '@/repositories/payments-repository'

export class PrismaPaymentsRepository implements PaymentsRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreatePaymentDTO): Promise<Payment> {
    const record = await this.prisma.payment.create({ data })
    return new Payment(record as unknown as PaymentData)
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const record = await this.prisma.payment.findUnique({ where: { orderId } })
    if (!record) return null
    return new Payment(record as unknown as PaymentData)
  }

  async listByUser(userId: string): Promise<Payment[]> {
    const records = await this.prisma.payment.findMany({
      where: { order: { userId } },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: { id: true, type: true, totalPrice: true, status: true, billingCycle: true, coffeeId: true, subscriptionId: true, courseId: true },
        },
      },
    })
    return records.map((r) => new Payment(r as unknown as PaymentData))
  }
}

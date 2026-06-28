import { PrismaClient } from '@prisma/client'
import { Payment, PaymentData } from '@/entities/payment'
import { PaymentsRepository, CreatePaymentDTO } from '@/repositories/payments-repository'

export class PrismaPaymentsRepository implements PaymentsRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreatePaymentDTO): Promise<Payment> {
    const record = await this.prisma.payment.create({ data })
    return new Payment(record as unknown as PaymentData)
  }

  async createWithOrderUpdate(data: CreatePaymentDTO, orderId: string): Promise<Payment> {
    const [paymentRecord] = await this.prisma.$transaction([
      this.prisma.payment.create({ data }),
      this.prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } }),
    ])
    return new Payment(paymentRecord as unknown as PaymentData)
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const record = await this.prisma.payment.findUnique({ where: { orderId } })
    if (!record) return null
    return new Payment(record as unknown as PaymentData)
  }

  async findByExternalId(externalId: string): Promise<Payment | null> {
    const record = await this.prisma.payment.findFirst({ where: { externalId } })
    if (!record) return null
    return new Payment(record as unknown as PaymentData)
  }

  async updateStatus(id: string, status: import('@/entities/payment').PaymentStatus, paidAt?: Date): Promise<Payment> {
    const record = await this.prisma.payment.update({
      where: { id },
      data: { status, paidAt: paidAt ?? null, ...(status === 'SUCCESS' ? {} : {}) },
    })
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

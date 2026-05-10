import { PrismaClient } from '@prisma/client'
import { Order, OrderData, OrderStatus } from '@/entities/order'
import { OrdersRepository, CreateOrderDTO } from '@/repositories/orders-repository'

export class PrismaOrdersRepository implements OrdersRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateOrderDTO): Promise<Order> {
    const record = await this.prisma.order.create({ data })
    return new Order(record as unknown as OrderData)
  }

  private get includeRelations() {
    return {
      coffee: { select: { id: true, name: true, photoUrl: true, saleType: true } },
      subscription: { select: { id: true, name: true } },
      course: { select: { id: true, title: true, imageUrl: true } },
      payment: true,
    }
  }

  async listByUser(userId: string): Promise<Order[]> {
    const records = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: this.includeRelations,
    })
    return records.map((r) => new Order(r as unknown as OrderData))
  }

  async listAll(): Promise<Order[]> {
    const records = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        ...this.includeRelations,
        user: { select: { id: true, name: true, email: true } },
      },
    })
    return records.map((r) => new Order(r as unknown as OrderData))
  }

  async findById(id: string): Promise<Order | null> {
    const record = await this.prisma.order.findFirst({
      where: { id },
      include: this.includeRelations,
    })
    if (!record) return null
    return new Order(record as unknown as OrderData)
  }

  async findActiveByUserAndSubscription(userId: string, subscriptionId: string): Promise<Order | null> {
    const record = await this.prisma.order.findFirst({
      where: { userId, subscriptionId, status: { in: ['PENDING', 'PAID'] } },
    })
    if (!record) return null
    return new Order(record as unknown as OrderData)
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const record = await this.prisma.order.update({
      where: { id },
      data: { status },
    })
    return new Order(record as unknown as OrderData)
  }
}

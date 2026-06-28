import { PrismaClient } from '@prisma/client'
import { Order, OrderData, OrderStatus, SubscriptionStatus } from '@/entities/order'
import { OrdersRepository, CreateOrderDTO, ListAllOrdersFilters } from '@/repositories/orders-repository'

export class PrismaOrdersRepository implements OrdersRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateOrderDTO): Promise<Order> {
    const record = await this.prisma.order.create({ data, include: this.includeRelations })
    return new Order(record as unknown as OrderData)
  }

  async createBatch(items: CreateOrderDTO[]): Promise<Order[]> {
    const records = await this.prisma.$transaction(
      items.map((data) => this.prisma.order.create({ data, include: this.includeRelations })),
    )
    return records.map((r) => new Order(r as unknown as OrderData))
  }

  private get includeRelations() {
    return {
      user: { select: { id: true, name: true, email: true, phoneNumber: true, cpf: true } },
      buyerSupplier: { select: { id: true, name: true, email: true } },
      coffee: { select: { id: true, name: true, photoUrl: true, saleType: true, supplierId: true } },
      subscription: { select: { id: true, name: true, supplierId: true } },
      course: { select: { id: true, title: true, imageUrl: true, supplierId: true } },
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

  async listBySupplier(supplierId: string): Promise<Order[]> {
    const records = await this.prisma.order.findMany({
      where: {
        OR: [
          { coffee: { supplierId } },
          { subscription: { supplierId } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: this.includeRelations,
    })
    return records.map((r) => new Order(r as unknown as OrderData))
  }

  async listAll(filters?: ListAllOrdersFilters): Promise<Order[]> {
    const records = await this.prisma.order.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.type && { type: filters.type }),
      },
      orderBy: { createdAt: 'desc' },
      skip: filters?.skip,
      take: filters?.take,
      include: this.includeRelations,
    })
    return records.map((r) => new Order(r as unknown as OrderData))
  }

  async countAll(filters?: Pick<ListAllOrdersFilters, 'status' | 'type'>): Promise<number> {
    return this.prisma.order.count({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.type && { type: filters.type }),
      },
    })
  }

  async listByBuyerSupplier(supplierId: string): Promise<Order[]> {
    const records = await this.prisma.order.findMany({
      where: { buyerSupplierId: supplierId },
      orderBy: { createdAt: 'desc' },
      include: this.includeRelations,
    })
    return records.map((r) => new Order(r as unknown as OrderData))
  }

  async findById(id: string): Promise<Order | null> {
    const record = await this.prisma.order.findUnique({
      where: { id },
      include: this.includeRelations,
    })
    if (!record) return null
    return new Order(record as unknown as OrderData)
  }

  async findActiveByUserAndSubscription(userId: string, subscriptionId: string): Promise<Order | null> {
    const record = await this.prisma.order.findFirst({
      where: { userId, subscriptionId, status: { in: ['PENDING', 'PAID'] } },
      include: this.includeRelations,
    })
    if (!record) return null
    return new Order(record as unknown as OrderData)
  }

  async findActiveCourseOrder(userId: string, courseId: string): Promise<Order | null> {
    const record = await this.prisma.order.findFirst({
      where: { userId, courseId, status: { in: ['PENDING', 'PAID'] } },
      include: this.includeRelations,
    })
    if (!record) return null
    return new Order(record as unknown as OrderData)
  }

  async updateStatus(id: string, status: OrderStatus, trackingCode?: string | null): Promise<Order> {
    const record = await this.prisma.order.update({
      where: { id },
      data: { status, ...(trackingCode !== undefined && { trackingCode }) },
      include: this.includeRelations,
    })
    return new Order(record as unknown as OrderData)
  }

  async updateSubscriptionStatus(
    id: string,
    subscriptionStatus: SubscriptionStatus,
    pausedAt?: Date | null,
  ): Promise<Order> {
    const record = await this.prisma.order.update({
      where: { id },
      data: { subscriptionStatus, pausedAt: pausedAt ?? null },
      include: this.includeRelations,
    })
    return new Order(record as unknown as OrderData)
  }
}

import { PrismaClient } from '@prisma/client'
import { SubscriptionDelivery, SubscriptionDeliveryData } from '@/entities/subscription-delivery'
import {
  SubscriptionDeliveriesRepository,
  CreateSubscriptionDeliveryDTO,
} from '@/repositories/subscription-deliveries-repository'

export class PrismaSubscriptionDeliveriesRepository implements SubscriptionDeliveriesRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateSubscriptionDeliveryDTO): Promise<SubscriptionDelivery> {
    const record = await this.prisma.subscriptionDelivery.create({
      data,
      include: { coffee: { select: { id: true, name: true, photoUrl: true } } },
    })
    return new SubscriptionDelivery(record as unknown as SubscriptionDeliveryData)
  }

  async listByOrder(orderId: string): Promise<SubscriptionDelivery[]> {
    const records = await this.prisma.subscriptionDelivery.findMany({
      where: { orderId },
      orderBy: { deliveredAt: 'desc' },
      include: { coffee: { select: { id: true, name: true, photoUrl: true } } },
    })
    return records.map((r) => new SubscriptionDelivery(r as unknown as SubscriptionDeliveryData))
  }
}

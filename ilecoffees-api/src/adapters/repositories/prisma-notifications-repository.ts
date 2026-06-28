import { PrismaClient } from '@prisma/client'
import { Notification, NotificationData } from '@/entities/notification'
import { CreateNotificationDTO, NotificationsRepository } from '@/repositories/notifications-repository'

export class PrismaNotificationsRepository implements NotificationsRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateNotificationDTO): Promise<Notification> {
    const record = await this.prisma.notification.create({ data: data as any })
    return new Notification(record as unknown as NotificationData)
  }

  async listByUser(userId: string, limit = 30): Promise<Notification[]> {
    const records = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return records.map((r) => new Notification(r as unknown as NotificationData))
  }

  async listBySupplier(supplierId: string, limit = 30): Promise<Notification[]> {
    const records = await this.prisma.notification.findMany({
      where: { supplierId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return records.map((r) => new Notification(r as unknown as NotificationData))
  }

  async markRead(id: string, ownerId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        id,
        readAt: null,
        OR: [{ userId: ownerId }, { supplierId: ownerId }],
      },
      data: { readAt: new Date() },
    })
  }

  async markAllRead(userId?: string, supplierId?: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        readAt: null,
        ...(userId ? { userId } : { supplierId }),
      },
      data: { readAt: new Date() },
    })
  }
}

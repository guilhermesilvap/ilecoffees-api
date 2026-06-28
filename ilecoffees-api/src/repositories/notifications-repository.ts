import { Notification } from '@/entities/notification'

export interface CreateNotificationDTO {
  userId?: string | null
  supplierId?: string | null
  type: string
  title: string
  body: string
  data?: Record<string, unknown> | null
}

export interface NotificationsRepository {
  create(data: CreateNotificationDTO): Promise<Notification>
  listByUser(userId: string, limit?: number): Promise<Notification[]>
  listBySupplier(supplierId: string, limit?: number): Promise<Notification[]>
  markRead(id: string, ownerId: string): Promise<void>
  markAllRead(userId?: string, supplierId?: string): Promise<void>
}

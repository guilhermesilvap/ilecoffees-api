import { CreateNotificationDTO, NotificationsRepository } from '@/repositories/notifications-repository'
import { NotificationChannel, NotificationPayload, NotificationRecipient } from './channels/notification-channel'

export class NotificationService {
  constructor(
    private notificationsRepository: NotificationsRepository,
    private channels: NotificationChannel[],
  ) {}

  async notify(
    recipient: NotificationRecipient,
    payload: NotificationPayload,
    target: { userId?: string | null; supplierId?: string | null },
  ): Promise<void> {
    await this.notificationsRepository.create({
      userId: target.userId,
      supplierId: target.supplierId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      data: payload.data,
    } as CreateNotificationDTO)

    await Promise.allSettled(this.channels.map((ch) => ch.send(recipient, payload)))
  }
}

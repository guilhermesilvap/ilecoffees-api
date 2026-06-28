import { sseService } from '@/services/sse-service'
import { NotificationChannel, NotificationPayload, NotificationRecipient } from './notification-channel'

export class SseChannel implements NotificationChannel {
  async send(recipient: NotificationRecipient, payload: NotificationPayload): Promise<void> {
    if (sseService.has(recipient.id)) {
      sseService.send(recipient.id, 'notification', { ...payload, createdAt: new Date() })
    }
  }
}

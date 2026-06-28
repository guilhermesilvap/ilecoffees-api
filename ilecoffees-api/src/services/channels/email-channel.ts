import { Resend } from 'resend'
import { env } from '@/env'
import { NotificationChannel, NotificationPayload, NotificationRecipient } from './notification-channel'
import { renderEmailTemplate } from '@/mail/render'

export class EmailChannel implements NotificationChannel {
  async send(recipient: NotificationRecipient, payload: NotificationPayload): Promise<void> {
    if (!recipient.email || !env.RESEND_API_KEY || !env.MAIL_FROM) return

    const html = await renderEmailTemplate(payload.type, { recipient, payload })
    if (!html) return

    const resend = new Resend(env.RESEND_API_KEY)
    await resend.emails.send({
      from: env.MAIL_FROM,
      to: recipient.email,
      subject: payload.title,
      html,
    })
  }
}

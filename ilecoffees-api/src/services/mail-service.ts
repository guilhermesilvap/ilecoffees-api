import { Resend } from 'resend'
import { env } from '@/env'
import { renderEmailTemplate } from '@/mail/render'

export class MailService {
  async send(options: {
    to: string
    name: string
    subject: string
    type: string
    data?: Record<string, unknown>
  }): Promise<void> {
    if (!env.RESEND_API_KEY || !env.MAIL_FROM) return

    const html = await renderEmailTemplate(options.type, {
      recipient: { id: '', name: options.name, email: options.to },
      payload: { type: options.type, title: options.subject, body: '', data: options.data ?? null },
    })
    if (!html) return

    const resend = new Resend(env.RESEND_API_KEY)
    await resend.emails.send({
      from: env.MAIL_FROM,
      to: options.to,
      subject: options.subject,
      html,
    })
  }
}

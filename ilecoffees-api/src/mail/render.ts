import { render } from '@react-email/components'
import * as React from 'react'
import { NotificationRecipient, NotificationPayload } from '@/services/channels/notification-channel'
import { PurchaseConfirmedEmail } from './templates/purchase-confirmed'
import { OrderStatusEmail } from './templates/order-status'
import { SubscriptionActivatedEmail } from './templates/subscription-activated'
import { WelcomeEmail } from './templates/welcome'
import { PasswordResetEmail } from './templates/password-reset'
import { EmailVerificationEmail } from './templates/email-verification'

interface TemplateContext {
  recipient: NotificationRecipient
  payload: NotificationPayload
}

export async function renderEmailTemplate(
  type: string,
  context: TemplateContext,
): Promise<string | null> {
  switch (type) {
    case 'PURCHASE':
      return render(React.createElement(PurchaseConfirmedEmail, context))
    case 'ORDER_STATUS':
      return render(React.createElement(OrderStatusEmail, context))
    case 'SUBSCRIPTION':
      return render(React.createElement(SubscriptionActivatedEmail, context))
    case 'WELCOME':
      return render(React.createElement(WelcomeEmail, context))
    case 'PASSWORD_RESET':
      return render(React.createElement(PasswordResetEmail, context))
    case 'EMAIL_VERIFICATION':
      return render(React.createElement(EmailVerificationEmail, context))
    default:
      return null
  }
}

import { render } from '@react-email/components'
import * as React from 'react'
import { NotificationRecipient, NotificationPayload } from '@/services/channels/notification-channel'
import { PurchaseConfirmedEmail } from './templates/purchase-confirmed'
import { OrderStatusEmail } from './templates/order-status'
import { SubscriptionActivatedEmail } from './templates/subscription-activated'

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
    default:
      return null
  }
}

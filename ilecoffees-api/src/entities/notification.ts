export type NotificationType =
  | 'PURCHASE'
  | 'ORDER_STATUS'
  | 'NEW_ORDER'
  | 'SUBSCRIPTION'
  | 'SYSTEM'
  | 'PRODUCT'
  | 'LOW_STOCK'

export interface NotificationData {
  id?: string
  userId?: string | null
  supplierId?: string | null
  type: string
  title: string
  body: string
  data?: Record<string, unknown> | null
  readAt?: Date | null
  createdAt?: Date
}

export class Notification {
  id?: string
  userId?: string | null
  supplierId?: string | null
  type!: string
  title!: string
  body!: string
  data?: Record<string, unknown> | null
  readAt?: Date | null
  createdAt?: Date

  constructor(data: NotificationData) {
    Object.assign(this, data)
  }
}

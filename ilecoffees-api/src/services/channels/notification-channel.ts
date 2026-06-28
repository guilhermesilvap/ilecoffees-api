export interface NotificationRecipient {
  id: string
  name: string
  email?: string | null
  phoneNumber?: string | null
}

export interface NotificationPayload {
  type: string
  title: string
  body: string
  data?: Record<string, unknown> | null
}

export interface NotificationChannel {
  send(recipient: NotificationRecipient, payload: NotificationPayload): Promise<void>
}

export type PaymentMethod = 'CREDIT_CARD' | 'PIX' | 'BOLETO' | 'MERCADO_PAGO' | 'STRIPE'
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'

export interface PaymentData {
  id?: string
  orderId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  paidAt?: Date | null
  createdAt?: Date
  externalId?: string | null
  pixQrCode?: string | null
  pixCopiaECola?: string | null
  pixExpiresAt?: Date | null
}

export class Payment {
  id?: string
  orderId!: string
  amount!: number
  method!: PaymentMethod
  status!: PaymentStatus
  paidAt?: Date | null
  createdAt?: Date
  externalId?: string | null
  pixQrCode?: string | null
  pixCopiaECola?: string | null
  pixExpiresAt?: Date | null

  constructor(data: PaymentData) {
    Object.assign(this, data)
  }
}

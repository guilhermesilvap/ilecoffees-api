import { Payment, PaymentMethod, PaymentStatus } from '@/entities/payment'

export interface CreatePaymentDTO {
  orderId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  paidAt?: Date | null
  externalId?: string | null
  pixQrCode?: string | null
  pixCopiaECola?: string | null
  pixExpiresAt?: Date | null
}

export interface PaymentsRepository {
  create(data: CreatePaymentDTO): Promise<Payment>
  createWithOrderUpdate(data: CreatePaymentDTO, orderId: string): Promise<Payment>
  findByOrderId(orderId: string): Promise<Payment | null>
  findByExternalId(externalId: string): Promise<Payment | null>
  updateStatus(id: string, status: PaymentStatus, paidAt?: Date): Promise<Payment>
  listByUser(userId: string): Promise<Payment[]>
}

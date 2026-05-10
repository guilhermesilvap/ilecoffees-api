import { Payment, PaymentMethod, PaymentStatus } from '@/entities/payment'

export interface CreatePaymentDTO {
  orderId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  paidAt?: Date | null
}

export interface PaymentsRepository {
  create(data: CreatePaymentDTO): Promise<Payment>
  findByOrderId(orderId: string): Promise<Payment | null>
  listByUser(userId: string): Promise<Payment[]>
}

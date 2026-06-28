import { Payment } from '@/entities/payment'
import { PaymentsRepository } from '@/repositories/payments-repository'

export class ListPaymentsUseCase {
  constructor(private paymentsRepository: PaymentsRepository) {}

  async execute(userId: string): Promise<Payment[]> {
    return this.paymentsRepository.listByUser(userId)
  }
}

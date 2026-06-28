import { AppError } from '@/utils/AppError'
import { Supplier } from '@/entities/supplier'
import { SuppliersRepository } from '@/repositories/suppliers-repository'
import { mpPaymentService } from '@/services/mercadopago-payment-service'
import { env } from '@/env'

export class ConnectMpAccountUseCase {
  constructor(private suppliersRepository: SuppliersRepository) {}

  async execute(supplierId: string, code: string): Promise<Supplier> {
    if (!env.MP_APP_ID || !env.MP_CLIENT_SECRET) {
      throw new AppError('Integração Mercado Pago não configurada', 503)
    }

    const supplier = await this.suppliersRepository.findById(supplierId)
    if (!supplier) throw new AppError('Fornecedor não encontrado', 404)

    const tokens = await mpPaymentService.exchangeCode(code)

    return this.suppliersRepository.updateMpTokens(supplierId, {
      mpAccessToken: tokens.accessToken,
      mpRefreshToken: tokens.refreshToken,
      mpUserId: tokens.userId,
      mpTokenExpiresAt: tokens.expiresAt,
    })
  }
}

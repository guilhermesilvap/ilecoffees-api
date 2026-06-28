import { AppError } from '@/utils/AppError'
import { Supplier } from '@/entities/supplier'
import { SuppliersRepository } from '@/repositories/suppliers-repository'

export class DisconnectMpAccountUseCase {
  constructor(private suppliersRepository: SuppliersRepository) {}

  async execute(supplierId: string): Promise<Supplier> {
    const supplier = await this.suppliersRepository.findById(supplierId)
    if (!supplier) throw new AppError('Fornecedor não encontrado', 404)

    return this.suppliersRepository.clearMpTokens(supplierId)
  }
}

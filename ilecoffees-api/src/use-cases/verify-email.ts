import { AppError } from '@/utils/AppError'
import { UsersRepository } from '@/repositories/users-repository'
import { SuppliersRepository } from '@/repositories/suppliers-repository'

export class VerifyEmailUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private suppliersRepository: SuppliersRepository,
  ) {}

  async execute(token: string): Promise<void> {
    const user = await this.usersRepository.findByVerificationToken(token)
    if (user) {
      await this.usersRepository.markEmailVerified(user.id!)
      return
    }

    const supplier = await this.suppliersRepository.findByVerificationToken(token)
    if (supplier) {
      await this.suppliersRepository.markEmailVerified(supplier.id!)
      return
    }

    throw new AppError('Token de verificação inválido ou já utilizado.', 400)
  }
}

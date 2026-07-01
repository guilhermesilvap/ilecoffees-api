import { hash } from 'bcrypt'
import { AppError } from '@/utils/AppError'
import { UsersRepository } from '@/repositories/users-repository'
import { SuppliersRepository } from '@/repositories/suppliers-repository'

interface ResetPasswordInput {
  token: string
  newPassword: string
}

export class ResetPasswordUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private suppliersRepository: SuppliersRepository,
  ) {}

  async execute({ token, newPassword }: ResetPasswordInput): Promise<void> {
    const [user, supplier] = await Promise.all([
      this.usersRepository.findByResetToken(token),
      this.suppliersRepository.findByResetToken(token),
    ])

    if (!user && !supplier) throw new AppError('Token inválido ou expirado', 400)

    const passwordHash = await hash(newPassword, 8)

    if (user) {
      await this.usersRepository.updatePassword(user.id!, passwordHash)
    } else {
      await this.suppliersRepository.updatePassword(supplier!.id!, passwordHash)
    }
  }
}

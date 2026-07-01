import { randomBytes } from 'crypto'
import { UsersRepository } from '@/repositories/users-repository'
import { SuppliersRepository } from '@/repositories/suppliers-repository'
import { MailService } from '@/services/mail-service'
import { env } from '@/env'

interface ForgotPasswordInput {
  email: string
}

export class ForgotPasswordUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private suppliersRepository: SuppliersRepository,
    private mailService: MailService,
  ) {}

  async execute({ email }: ForgotPasswordInput): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim()

    const user = await this.usersRepository.findByEmail(normalizedEmail)
    const supplier = await this.suppliersRepository.findByEmail(normalizedEmail)

    const account = user ?? supplier
    if (!account) return // Silencioso — não revela se o e-mail existe

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    const frontendUrl = env.FRONTEND_URL || 'https://ilecoffees.com.br'
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`

    if (user) {
      await this.usersRepository.setResetToken(user.id!, token, expiresAt)
    } else if (supplier) {
      await this.suppliersRepository.setResetToken(supplier.id!, token, expiresAt)
    }

    await this.mailService.send({
      to: account.email,
      name: account.name,
      subject: 'Redefinição de senha — ilecoffees',
      type: 'PASSWORD_RESET',
      data: { resetUrl },
    })
  }
}

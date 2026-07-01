import { hash } from 'bcrypt'
import { randomBytes } from 'crypto'
import { AppError } from '@/utils/AppError'
import { User } from '@/entities/user'
import { UsersRepository, CreateUserDTO } from '@/repositories/users-repository'
import { SuppliersRepository } from '@/repositories/suppliers-repository'
import { MailService } from '@/services/mail-service'
import { env } from '@/env'

interface CreateUserInput extends Omit<CreateUserDTO, 'passwordHash'> {
  password: string
}

export class CreateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private suppliersRepository: SuppliersRepository,
    private mailService: MailService,
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const email = input.email.toLowerCase().trim()

    const emailTakenByUser = await this.usersRepository.existsByEmail(email)
    const emailTakenBySupplier = await this.suppliersRepository.existsByEmail(email)

    if (emailTakenByUser || emailTakenBySupplier) {
      throw new AppError('Já existe um usuário cadastrado com este e-mail')
    }

    const { password, ...rest } = input
    const passwordHash = await hash(password, 8)
    const verificationToken = randomBytes(32).toString('hex')

    const user = await this.usersRepository.create({
      ...rest,
      email,
      passwordHash,
      emailVerified: false,
      emailVerificationToken: verificationToken,
    })

    const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`

    this.mailService.send({
      to: user.email,
      name: user.name,
      subject: 'Confirme seu e-mail — ilecoffees',
      type: 'EMAIL_VERIFICATION',
      data: { verifyUrl },
    }).catch(() => {})

    return user
  }
}

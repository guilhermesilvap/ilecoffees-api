import { compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { AppError } from '@/utils/AppError'
import { authConfig } from '@/configs/auth'
import { UsersRepository } from '@/repositories/users-repository'
import { SuppliersRepository } from '@/repositories/suppliers-repository'
import { AdminsRepository } from '@/repositories/admins-repository'

interface CreateSessionInput {
  email: string
  password: string
}

interface CreateSessionOutput {
  token: string
  account: Record<string, unknown>
  type: 'USER' | 'SUPPLIER' | 'ADMIN'
}

export class CreateSessionUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private suppliersRepository: SuppliersRepository,
    private adminsRepository: AdminsRepository,
  ) {}

  async execute({ email, password }: CreateSessionInput): Promise<CreateSessionOutput> {
    let account: Record<string, unknown> | null = null
    let type: 'USER' | 'SUPPLIER' | 'ADMIN' = 'USER'

    const user = await this.usersRepository.findByEmail(email)
    if (user) {
      account = user as unknown as Record<string, unknown>
      type = 'USER'
    }

    if (!account) {
      const supplier = await this.suppliersRepository.findByEmail(email)
      if (supplier) {
        account = supplier as unknown as Record<string, unknown>
        type = 'SUPPLIER'
      }
    }

    if (!account) {
      const admin = await this.adminsRepository.findByEmail(email)
      if (admin) {
        account = admin as unknown as Record<string, unknown>
        type = 'ADMIN'
      }
    }

    if (!account) throw new AppError('E-mail ou senha inválidos', 401)

    const passwordMatched = await compare(password, account.passwordHash as string)
    if (!passwordMatched) throw new AppError('E-mail ou senha inválidos', 401)

    const { secret, expiresIn } = authConfig.jwt
    const token = sign({ id: account.id, type }, secret, { expiresIn })

    const { passwordHash: _, ...accountSafe } = account

    return { token, account: accountSafe, type }
  }
}

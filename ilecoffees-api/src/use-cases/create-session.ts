import { compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { AppError } from '@/utils/AppError'
import { authConfig } from '@/configs/auth'
import { UsersRepository } from '@/repositories/users-repository'
import { SuppliersRepository } from '@/repositories/suppliers-repository'
import { AdminsRepository } from '@/repositories/admins-repository'
import { EmployeesRepository } from '@/repositories/employees-repository'

interface CreateSessionInput {
  email: string
  password: string
}

interface CreateSessionOutput {
  token: string
  refreshToken: string
  account: Record<string, unknown>
  type: 'USER' | 'SUPPLIER' | 'ADMIN' | 'EMPLOYEE'
  supplierType?: 'PRODUCER' | 'ROASTER'
  coffeeshopId?: string
}

export class CreateSessionUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private suppliersRepository: SuppliersRepository,
    private adminsRepository: AdminsRepository,
    private employeesRepository: EmployeesRepository,
  ) {}

  async execute({ email, password }: CreateSessionInput): Promise<CreateSessionOutput> {
    const normalizedEmail = email.toLowerCase().trim()
    let account: Record<string, unknown> | null = null
    let type: 'USER' | 'SUPPLIER' | 'ADMIN' | 'EMPLOYEE' = 'USER'

    const user = await this.usersRepository.findByEmail(normalizedEmail)
    if (user) {
      account = user as unknown as Record<string, unknown>
      type = 'USER'
    }

    if (!account) {
      const supplier = await this.suppliersRepository.findByEmail(normalizedEmail)
      if (supplier) {
        account = supplier as unknown as Record<string, unknown>
        type = 'SUPPLIER'
      }
    }

    if (!account) {
      const admin = await this.adminsRepository.findByEmail(normalizedEmail)
      if (admin) {
        account = admin as unknown as Record<string, unknown>
        type = 'ADMIN'
      }
    }

    if (!account) {
      const employee = await this.employeesRepository.findByEmail(normalizedEmail)
      if (employee) {
        account = employee as unknown as Record<string, unknown>
        type = 'EMPLOYEE'
        await this.employeesRepository.updateLastAccess(employee.id)
      }
    }

    if (!account) throw new AppError('E-mail ou senha inválidos', 401)

    const passwordMatched = await compare(password, account.passwordHash as string)
    if (!passwordMatched) throw new AppError('E-mail ou senha inválidos', 401)

    if (account.emailVerified === false) {
      throw new AppError('Confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada.', 403)
    }

    const { secret, expiresIn, refreshSecret, refreshExpiresIn } = authConfig.jwt
    const payload: Record<string, unknown> = { id: account.id, type }
    if (type === 'USER') payload.accountType = account.accountType
    if (type === 'SUPPLIER') payload.supplierType = account.supplierType
    if (type === 'EMPLOYEE') payload.coffeeshopId = account.coffeeshopId

    const token = sign(payload, secret, { expiresIn } as Parameters<typeof sign>[2])
    const refreshToken = sign({ id: account.id, type }, refreshSecret, { expiresIn: refreshExpiresIn } as Parameters<typeof sign>[2])

    const { passwordHash: _, ...accountSafe } = account
    const supplierType = type === 'SUPPLIER' ? (account.supplierType as 'PRODUCER' | 'ROASTER') : undefined
    const coffeeshopId = type === 'EMPLOYEE' ? (account.coffeeshopId as string) : undefined

    return { token, refreshToken, account: accountSafe, type, supplierType, coffeeshopId }
  }
}

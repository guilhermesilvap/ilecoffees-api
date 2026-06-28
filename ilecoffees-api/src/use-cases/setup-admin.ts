import { hash } from 'bcrypt'
import { AppError } from '@/utils/AppError'
import { Admin } from '@/entities/admin'
import { AdminsRepository } from '@/repositories/admins-repository'

interface SetupAdminInput {
  name: string
  email: string
  password: string
}

export class SetupAdminUseCase {
  constructor(private adminsRepository: AdminsRepository) {}

  async execute(input: SetupAdminInput): Promise<Admin> {
    const total = await this.adminsRepository.count()
    if (total > 0) {
      throw new AppError('Setup já foi realizado. Use a rota autenticada para criar novos admins.', 403)
    }

    const existing = await this.adminsRepository.findByEmail(input.email)
    if (existing) throw new AppError('Já existe um admin com este e-mail')

    const passwordHash = await hash(input.password, 8)
    return this.adminsRepository.create({ name: input.name, email: input.email, passwordHash })
  }
}

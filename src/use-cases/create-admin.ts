import { hash } from 'bcrypt'
import { AppError } from '@/utils/AppError'
import { Admin } from '@/entities/admin'
import { AdminsRepository } from '@/repositories/admins-repository'

interface CreateAdminInput {
  name: string
  email: string
  password: string
}

export class CreateAdminUseCase {
  constructor(private adminsRepository: AdminsRepository) {}

  async execute(input: CreateAdminInput): Promise<Admin> {
    const existing = await this.adminsRepository.findByEmail(input.email)
    if (existing) throw new AppError('Já existe um admin com este e-mail')

    const passwordHash = await hash(input.password, 8)

    return this.adminsRepository.create({ name: input.name, email: input.email, passwordHash })
  }
}

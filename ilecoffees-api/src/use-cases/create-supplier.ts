import { hash } from 'bcrypt'
import { AppError } from '@/utils/AppError'
import { Supplier } from '@/entities/supplier'
import { SuppliersRepository, CreateSupplierDTO } from '@/repositories/suppliers-repository'
import { UsersRepository } from '@/repositories/users-repository'

interface CreateSupplierInput extends Omit<CreateSupplierDTO, 'passwordHash'> {
  password: string
}

export class CreateSupplierUseCase {
  constructor(
    private suppliersRepository: SuppliersRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute(input: CreateSupplierInput): Promise<Supplier> {
    const email = input.email.toLowerCase().trim()

    const emailTakenByUser = await this.usersRepository.existsByEmail(email)
    const emailTakenBySupplier = await this.suppliersRepository.existsByEmail(email)

    if (emailTakenByUser || emailTakenBySupplier) {
      throw new AppError('Já existe um usuário cadastrado com este e-mail')
    }

    const { password, ...rest } = input
    const passwordHash = await hash(password, 8)

    return this.suppliersRepository.create({ ...rest, email, passwordHash })
  }
}

import { hash } from 'bcrypt'
import { AppError } from '@/utils/AppError'
import { User } from '@/entities/user'
import { UsersRepository, CreateUserDTO } from '@/repositories/users-repository'
import { SuppliersRepository } from '@/repositories/suppliers-repository'

interface CreateUserInput extends Omit<CreateUserDTO, 'passwordHash'> {
  password: string
}

export class CreateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private suppliersRepository: SuppliersRepository,
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

    return this.usersRepository.create({ ...rest, email, passwordHash })
  }
}

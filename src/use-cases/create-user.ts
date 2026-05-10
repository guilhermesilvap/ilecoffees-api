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
    const emailTakenByUser = await this.usersRepository.findByEmail(input.email)
    const emailTakenBySupplier = await this.suppliersRepository.findByEmail(input.email)

    if (emailTakenByUser || emailTakenBySupplier) {
      throw new AppError('Já existe um usuário cadastrado com este e-mail')
    }

    const passwordHash = await hash(input.password, 8)

    return this.usersRepository.create({ ...input, passwordHash })
  }
}

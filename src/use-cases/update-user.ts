import { AppError } from '@/utils/AppError'
import { User } from '@/entities/user'
import { UsersRepository, UpdateUserDTO } from '@/repositories/users-repository'

export class UpdateUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(id: string, data: UpdateUserDTO): Promise<User> {
    const existing = await this.usersRepository.findById(id)
    if (!existing) throw new AppError('Usuário não encontrado', 404)

    return this.usersRepository.update(id, data)
  }
}

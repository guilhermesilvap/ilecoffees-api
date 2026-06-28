import { AppError } from '@/utils/AppError'
import { UsersRepository } from '@/repositories/users-repository'

export class DeleteUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.usersRepository.findById(id)
    if (!existing) throw new AppError('Usuário não encontrado', 404)

    await this.usersRepository.softDelete(id)
  }
}

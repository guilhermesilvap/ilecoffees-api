import { User } from '@/entities/user'
import { UsersRepository } from '@/repositories/users-repository'

export class ListUsersUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(): Promise<User[]> {
    return this.usersRepository.list()
  }
}

import { User } from '@/entities/user'
import { UsersRepository } from '@/repositories/users-repository'

export interface ListUsersInput {
  page?: number
  limit?: number
}

export interface ListUsersResult {
  items: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class ListUsersUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(input?: ListUsersInput): Promise<ListUsersResult> {
    const page = Math.max(1, input?.page ?? 1)
    const limit = Math.min(100, Math.max(1, input?.limit ?? 30))
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      this.usersRepository.list({ skip, take: limit }),
      this.usersRepository.count(),
    ])

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }
}

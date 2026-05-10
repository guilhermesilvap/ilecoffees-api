import { PrismaClient } from '@prisma/client'
import { User, UserData } from '@/entities/user'
import { UsersRepository, CreateUserDTO, UpdateUserDTO } from '@/repositories/users-repository'

export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateUserDTO): Promise<User> {
    const record = await this.prisma.user.create({ data })
    return new User(record as unknown as UserData)
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({ where: { email } })
    if (!record) return null
    return new User(record as unknown as UserData)
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({ where: { id, deletedAt: null } })
    if (!record) return null
    return new User(record as unknown as UserData)
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const record = await this.prisma.user.update({ where: { id }, data })
    return new User(record as unknown as UserData)
  }

  async list(): Promise<User[]> {
    const records = await this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
    return records.map((r) => new User(r as unknown as UserData))
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}

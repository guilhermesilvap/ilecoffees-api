import { PrismaClient, User as PrismaUser } from '@prisma/client'
import { User, UserData, AccountType } from '@/entities/user'
import { UsersRepository, CreateUserDTO, UpdateUserDTO } from '@/repositories/users-repository'

function toUserDomain(r: PrismaUser): User {
  return new User({
    id: r.id,
    photoUrl: r.photoUrl,
    accountType: r.accountType as AccountType,
    name: r.name,
    email: r.email,
    phoneNumber: r.phoneNumber,
    passwordHash: r.passwordHash,
    cep: r.cep,
    street: r.street,
    number: r.number,
    district: r.district,
    city: r.city,
    state: r.state,
    complement: r.complement,
    emailVerified: r.emailVerified,
    deletedAt: r.deletedAt,
    createdAt: r.createdAt,
  } satisfies UserData)
}

export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateUserDTO): Promise<User> {
    const record = await this.prisma.user.create({ data })
    return toUserDomain(record)
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' }, deletedAt: null } })
    if (!record) return null
    return toUserDomain(record)
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email: { equals: email, mode: 'insensitive' } } })
    return count > 0
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({ where: { id, deletedAt: null } })
    if (!record) return null
    return toUserDomain(record)
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const record = await this.prisma.user.update({ where: { id }, data })
    return toUserDomain(record)
  }

  async list(opts?: { skip?: number; take?: number }): Promise<User[]> {
    const records = await this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip: opts?.skip,
      take: opts?.take,
    })
    return records.map(toUserDomain)
  }

  async count(): Promise<number> {
    return this.prisma.user.count({ where: { deletedAt: null } })
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  async setResetToken(id: string, token: string, expiresAt: Date): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { passwordResetToken: token, passwordResetTokenExpiresAt: expiresAt } })
  }

  async findByResetToken(token: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: { passwordResetToken: token, deletedAt: null, passwordResetTokenExpiresAt: { gt: new Date() } },
    })
    if (!record) return null
    return toUserDomain(record)
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { passwordHash, passwordResetToken: null, passwordResetTokenExpiresAt: null } })
  }

  async setVerificationToken(id: string, token: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { emailVerificationToken: token, emailVerified: false } })
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({ where: { emailVerificationToken: token, deletedAt: null } })
    if (!record) return null
    return toUserDomain(record)
  }

  async markEmailVerified(id: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { emailVerified: true, emailVerificationToken: null } })
  }
}

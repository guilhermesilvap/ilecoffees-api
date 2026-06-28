import { PrismaClient, Admin as PrismaAdmin } from '@prisma/client'
import { Admin, AdminData } from '@/entities/admin'
import { AdminsRepository, CreateAdminDTO } from '@/repositories/admins-repository'

function toAdminDomain(r: PrismaAdmin): Admin {
  return new Admin({
    id: r.id,
    name: r.name,
    email: r.email,
    passwordHash: r.passwordHash,
    createdAt: r.createdAt,
  } satisfies AdminData)
}

export class PrismaAdminsRepository implements AdminsRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateAdminDTO): Promise<Admin> {
    const record = await this.prisma.admin.create({ data })
    return toAdminDomain(record)
  }

  async findByEmail(email: string): Promise<Admin | null> {
    const record = await this.prisma.admin.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
    if (!record) return null
    return toAdminDomain(record)
  }

  async count(): Promise<number> {
    return this.prisma.admin.count()
  }
}

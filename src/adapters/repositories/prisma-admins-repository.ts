import { PrismaClient } from '@prisma/client'
import { Admin, AdminData } from '@/entities/admin'
import { AdminsRepository, CreateAdminDTO } from '@/repositories/admins-repository'

export class PrismaAdminsRepository implements AdminsRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateAdminDTO): Promise<Admin> {
    const record = await this.prisma.admin.create({ data })
    return new Admin(record as unknown as AdminData)
  }

  async findByEmail(email: string): Promise<Admin | null> {
    const record = await this.prisma.admin.findFirst({ where: { email } })
    if (!record) return null
    return new Admin(record as unknown as AdminData)
  }
}

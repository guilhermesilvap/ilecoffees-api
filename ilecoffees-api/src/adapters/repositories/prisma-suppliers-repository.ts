import { PrismaClient, Supplier as PrismaSupplier } from '@prisma/client'
import { Supplier, SupplierData, SupplierType } from '@/entities/supplier'
import { SuppliersRepository, CreateSupplierDTO, UpdateSupplierDTO, ListSuppliersFilters, MpTokensDTO } from '@/repositories/suppliers-repository'

function toSupplierDomain(r: PrismaSupplier): Supplier {
  return new Supplier({
    id: r.id,
    photoUrl: r.photoUrl,
    name: r.name,
    email: r.email,
    passwordHash: r.passwordHash,
    supplierType: r.supplierType as SupplierType,
    cep: r.cep,
    street: r.street,
    number: r.number,
    district: r.district,
    city: r.city,
    state: r.state,
    complement: r.complement,
    isActive: r.isActive,
    planId: r.planId,
    mpAccessToken: r.mpAccessToken,
    mpRefreshToken: r.mpRefreshToken,
    mpUserId: r.mpUserId,
    mpTokenExpiresAt: r.mpTokenExpiresAt,
    emailVerified: r.emailVerified,
    deletedAt: r.deletedAt,
    createdAt: r.createdAt,
  } satisfies SupplierData)
}

export class PrismaSuppliersRepository implements SuppliersRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateSupplierDTO): Promise<Supplier> {
    const record = await this.prisma.supplier.create({ data })
    return toSupplierDomain(record)
  }

  async findByEmail(email: string): Promise<Supplier | null> {
    const record = await this.prisma.supplier.findFirst({ where: { email: { equals: email, mode: 'insensitive' }, deletedAt: null } })
    if (!record) return null
    return toSupplierDomain(record)
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.supplier.count({ where: { email: { equals: email, mode: 'insensitive' } } })
    return count > 0
  }

  async findById(id: string): Promise<Supplier | null> {
    const record = await this.prisma.supplier.findFirst({ where: { id, deletedAt: null } })
    if (!record) return null
    return toSupplierDomain(record)
  }

  async update(id: string, data: UpdateSupplierDTO): Promise<Supplier> {
    const record = await this.prisma.supplier.update({ where: { id }, data })
    return toSupplierDomain(record)
  }

  async list(filters?: ListSuppliersFilters): Promise<Supplier[]> {
    const records = await this.prisma.supplier.findMany({
      where: {
        deletedAt: null,
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
      orderBy: { createdAt: 'desc' },
      skip: filters?.skip,
      take: filters?.take,
    })
    return records.map(toSupplierDomain)
  }

  async count(filters?: { isActive?: boolean }): Promise<number> {
    return this.prisma.supplier.count({
      where: {
        deletedAt: null,
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
    })
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.supplier.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  async toggleStatus(id: string, isActive: boolean): Promise<Supplier> {
    const record = await this.prisma.supplier.update({ where: { id }, data: { isActive } })
    return toSupplierDomain(record)
  }

  async assignPlan(id: string, planId: string | null): Promise<Supplier> {
    const record = await this.prisma.supplier.update({ where: { id }, data: { planId } })
    return toSupplierDomain(record)
  }

  async clearPlanFromSuppliers(planId: string): Promise<void> {
    await this.prisma.supplier.updateMany({ where: { planId }, data: { planId: null } })
  }

  async updateMpTokens(id: string, tokens: MpTokensDTO): Promise<Supplier> {
    const record = await this.prisma.supplier.update({ where: { id }, data: tokens })
    return toSupplierDomain(record)
  }

  async clearMpTokens(id: string): Promise<Supplier> {
    const record = await this.prisma.supplier.update({
      where: { id },
      data: { mpAccessToken: null, mpRefreshToken: null, mpUserId: null, mpTokenExpiresAt: null },
    })
    return toSupplierDomain(record)
  }

  async setResetToken(id: string, token: string, expiresAt: Date): Promise<void> {
    await this.prisma.supplier.update({ where: { id }, data: { passwordResetToken: token, passwordResetTokenExpiresAt: expiresAt } })
  }

  async findByResetToken(token: string): Promise<Supplier | null> {
    const record = await this.prisma.supplier.findFirst({
      where: { passwordResetToken: token, deletedAt: null, passwordResetTokenExpiresAt: { gt: new Date() } },
    })
    if (!record) return null
    return toSupplierDomain(record)
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.prisma.supplier.update({ where: { id }, data: { passwordHash, passwordResetToken: null, passwordResetTokenExpiresAt: null } })
  }

  async setVerificationToken(id: string, token: string): Promise<void> {
    await this.prisma.supplier.update({ where: { id }, data: { emailVerificationToken: token, emailVerified: false } })
  }

  async findByVerificationToken(token: string): Promise<Supplier | null> {
    const record = await this.prisma.supplier.findFirst({ where: { emailVerificationToken: token, deletedAt: null } })
    if (!record) return null
    return toSupplierDomain(record)
  }

  async markEmailVerified(id: string): Promise<void> {
    await this.prisma.supplier.update({ where: { id }, data: { emailVerified: true, emailVerificationToken: null } })
  }
}

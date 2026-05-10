import { PrismaClient } from '@prisma/client'
import { Supplier, SupplierData } from '@/entities/supplier'
import { SuppliersRepository, CreateSupplierDTO, UpdateSupplierDTO } from '@/repositories/suppliers-repository'

export class PrismaSuppliersRepository implements SuppliersRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateSupplierDTO): Promise<Supplier> {
    const record = await this.prisma.supplier.create({ data })
    return new Supplier(record as unknown as SupplierData)
  }

  async findByEmail(email: string): Promise<Supplier | null> {
    const record = await this.prisma.supplier.findFirst({ where: { email } })
    if (!record) return null
    return new Supplier(record as unknown as SupplierData)
  }

  async findById(id: string): Promise<Supplier | null> {
    const record = await this.prisma.supplier.findFirst({ where: { id, deletedAt: null } })
    if (!record) return null
    return new Supplier(record as unknown as SupplierData)
  }

  async update(id: string, data: UpdateSupplierDTO): Promise<Supplier> {
    const record = await this.prisma.supplier.update({ where: { id }, data })
    return new Supplier(record as unknown as SupplierData)
  }

  async list(): Promise<Supplier[]> {
    const records = await this.prisma.supplier.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
    return records.map((r) => new Supplier(r as unknown as SupplierData))
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.supplier.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}

import { PrismaClient } from '@prisma/client'
import { SupplierPlan, SupplierPlanData } from '@/entities/supplier-plan'
import {
  SupplierPlansRepository,
  CreateSupplierPlanDTO,
  UpdateSupplierPlanDTO,
} from '@/repositories/supplier-plans-repository'

export class PrismaSupplierPlansRepository implements SupplierPlansRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateSupplierPlanDTO): Promise<SupplierPlan> {
    const record = await this.prisma.supplierPlan.create({ data })
    return new SupplierPlan(record as unknown as SupplierPlanData)
  }

  async update(id: string, data: UpdateSupplierPlanDTO): Promise<SupplierPlan> {
    const record = await this.prisma.supplierPlan.update({ where: { id }, data })
    return new SupplierPlan(record as unknown as SupplierPlanData)
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.supplierPlan.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  async list(): Promise<SupplierPlan[]> {
    const records = await this.prisma.supplierPlan.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
    return records.map((r) => new SupplierPlan(r as unknown as SupplierPlanData))
  }

  async findById(id: string): Promise<SupplierPlan | null> {
    const record = await this.prisma.supplierPlan.findFirst({ where: { id, deletedAt: null } })
    if (!record) return null
    return new SupplierPlan(record as unknown as SupplierPlanData)
  }
}

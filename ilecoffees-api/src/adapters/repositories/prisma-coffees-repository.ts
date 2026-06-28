import { PrismaClient, Coffee as PrismaCoffee } from '@prisma/client'
import { Coffee, CoffeeData, SaleType } from '@/entities/coffee'
import {
  CoffeesRepository,
  CreateCoffeeDTO,
  UpdateCoffeeDTO,
  ListCoffeesFilters,
} from '@/repositories/coffees-repository'
import { AppError } from '@/utils/AppError'

function toCoffeeDomain(r: PrismaCoffee & { supplier?: unknown }): Coffee {
  return new Coffee({
    id: r.id,
    supplierId: r.supplierId,
    photoUrl: r.photoUrl,
    name: r.name,
    description: r.description ?? '',
    variety: r.variety ?? '',
    process: r.process ?? '',
    region: r.region ?? '',
    altitude: r.altitude ?? 0,
    farm: r.farm ?? '',
    producer: r.producer ?? '',
    score: r.score ?? 0,
    sensory: r.sensory ?? '',
    roast: r.roast ?? '',
    saleType: r.saleType as SaleType,
    pricePerKg: r.pricePerKg,
    packagePrice: r.packagePrice,
    packagePriceCoffeeshop: r.packagePriceCoffeeshop,
    packageWeight: r.packageWeight,
    stock: r.stock,
    weightGrams: r.weightGrams,
    heightCm: r.heightCm,
    widthCm: r.widthCm,
    lengthCm: r.lengthCm,
    deletedAt: r.deletedAt,
    createdAt: r.createdAt,
    ...(r.supplier !== undefined && { supplier: r.supplier }),
  } satisfies CoffeeData)
}

export class PrismaCoffeesRepository implements CoffeesRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateCoffeeDTO): Promise<Coffee> {
    const record = await this.prisma.coffee.create({ data })
    return toCoffeeDomain(record)
  }

  async update(id: string, data: UpdateCoffeeDTO): Promise<Coffee> {
    const record = await this.prisma.coffee.update({ where: { id }, data })
    return toCoffeeDomain(record)
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.coffee.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  async softDeleteBySupplier(supplierId: string): Promise<void> {
    await this.prisma.coffee.updateMany({
      where: { supplierId, deletedAt: null },
      data: { deletedAt: new Date() },
    })
  }

  async findManyByIds(ids: string[]): Promise<Coffee[]> {
    const records = await this.prisma.coffee.findMany({
      where: { id: { in: ids }, deletedAt: null },
    })
    return records.map(toCoffeeDomain)
  }

  async findById(id: string): Promise<Coffee | null> {
    const record = await this.prisma.coffee.findFirst({ where: { id, deletedAt: null } })
    if (!record) return null
    return toCoffeeDomain(record)
  }

  async decrementStock(id: string, quantity: number): Promise<void> {
    const result = await this.prisma.coffee.updateMany({
      where: { id, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    })
    if (result.count === 0) {
      throw new AppError('Estoque insuficiente', 400)
    }
  }

  async list(filters: ListCoffeesFilters): Promise<Coffee[]> {
    const records = await this.prisma.coffee.findMany({
      where: {
        deletedAt: null,
        supplier: {
          isActive: true,
          ...(filters.supplierType && { supplierType: filters.supplierType }),
        },
        ...(filters.supplierId && { supplierId: filters.supplierId }),
        ...(filters.name && { name: { contains: filters.name, mode: 'insensitive' } }),
        ...(filters.description && { description: { contains: filters.description, mode: 'insensitive' } }),
        ...(filters.variety && { variety: { contains: filters.variety, mode: 'insensitive' } }),
        ...(filters.process && { process: { contains: filters.process, mode: 'insensitive' } }),
        ...(filters.region && { region: { contains: filters.region, mode: 'insensitive' } }),
        ...(filters.farm && { farm: { contains: filters.farm, mode: 'insensitive' } }),
        ...(filters.producer && { producer: { contains: filters.producer, mode: 'insensitive' } }),
        ...(filters.sensory && { sensory: { contains: filters.sensory, mode: 'insensitive' } }),
        ...(filters.roast && { roast: { contains: filters.roast, mode: 'insensitive' } }),
        ...(filters.altitude !== undefined && { altitude: filters.altitude }),
        ...(filters.score !== undefined && { score: filters.score }),
        ...(filters.saleType && {
          saleType: filters.saleType === 'PACKAGE'
            ? { in: ['PACKAGE', 'BOTH'] as const }
            : filters.saleType === 'KG'
            ? { in: ['KG', 'BOTH'] as const }
            : filters.saleType,
        }),
        ...(filters.pricePerKg !== undefined && { pricePerKg: filters.pricePerKg }),
        ...(filters.packagePrice !== undefined && { packagePrice: filters.packagePrice }),
        ...(filters.packageWeight !== undefined && { packageWeight: filters.packageWeight }),
        ...(filters.stock !== undefined && { stock: filters.stock }),
      },
      include: {
        supplier: { select: { id: true, name: true, photoUrl: true, supplierType: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return records.map(toCoffeeDomain)
  }
}

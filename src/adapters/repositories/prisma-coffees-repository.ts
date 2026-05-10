import { PrismaClient } from '@prisma/client'
import { Coffee, CoffeeData } from '@/entities/coffee'
import {
  CoffeesRepository,
  CreateCoffeeDTO,
  UpdateCoffeeDTO,
  ListCoffeesFilters,
} from '@/repositories/coffees-repository'

export class PrismaCoffeesRepository implements CoffeesRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateCoffeeDTO): Promise<Coffee> {
    const record = await this.prisma.coffee.create({ data })
    return new Coffee(record as unknown as CoffeeData)
  }

  async update(id: string, data: UpdateCoffeeDTO): Promise<Coffee> {
    const record = await this.prisma.coffee.update({ where: { id }, data })
    return new Coffee(record as unknown as CoffeeData)
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.coffee.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  async findById(id: string): Promise<Coffee | null> {
    const record = await this.prisma.coffee.findFirst({ where: { id, deletedAt: null } })
    if (!record) return null
    return new Coffee(record as unknown as CoffeeData)
  }

  async decrementStock(id: string, quantity: number): Promise<void> {
    await this.prisma.coffee.update({
      where: { id },
      data: { stock: { decrement: quantity } },
    })
  }

  async list(filters: ListCoffeesFilters): Promise<Coffee[]> {
    const records = await this.prisma.coffee.findMany({
      where: {
        deletedAt: null,
        ...(filters.supplierId && { supplierId: filters.supplierId }),
        ...(filters.name && { name: { contains: filters.name, mode: 'insensitive' } }),
        ...(filters.description && {
          description: { contains: filters.description, mode: 'insensitive' },
        }),
        ...(filters.variety && { variety: { contains: filters.variety, mode: 'insensitive' } }),
        ...(filters.process && { process: { contains: filters.process, mode: 'insensitive' } }),
        ...(filters.region && { region: { contains: filters.region, mode: 'insensitive' } }),
        ...(filters.farm && { farm: { contains: filters.farm, mode: 'insensitive' } }),
        ...(filters.producer && { producer: { contains: filters.producer, mode: 'insensitive' } }),
        ...(filters.sensory && { sensory: { contains: filters.sensory, mode: 'insensitive' } }),
        ...(filters.roast && { roast: { contains: filters.roast, mode: 'insensitive' } }),
        ...(filters.altitude !== undefined && { altitude: filters.altitude }),
        ...(filters.score !== undefined && { score: filters.score }),
        ...(filters.saleType && { saleType: filters.saleType }),
        ...(filters.pricePerKg !== undefined && { pricePerKg: filters.pricePerKg }),
        ...(filters.packagePrice !== undefined && { packagePrice: filters.packagePrice }),
        ...(filters.packageWeight !== undefined && { packageWeight: filters.packageWeight }),
        ...(filters.stock !== undefined && { stock: filters.stock }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return records.map((r) => new Coffee(r as unknown as CoffeeData))
  }
}

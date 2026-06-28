import { PrismaClient } from '@prisma/client'
import { CoffeeshopStock } from '@/entities/coffeeshop-stock'
import { CoffeeshopStockRepository, CoffeeshopStockForSupplierRow, UpsertCoffeeshopStockDTO } from '@/repositories/coffeeshop-stock-repository'

const coffeeInclude = {
  select: {
    id: true,
    name: true,
    photoUrl: true,
    saleType: true,
    pricePerKg: true,
    packagePriceCoffeeshop: true,
    supplier: { select: { id: true, name: true } },
  },
}

export class PrismaCoffeeshopStockRepository implements CoffeeshopStockRepository {
  constructor(private prisma: PrismaClient) {}

  async listByUser(userId: string): Promise<CoffeeshopStock[]> {
    const records = await this.prisma.coffeeshopStock.findMany({
      where: { userId },
      include: { coffee: coffeeInclude },
      orderBy: { updatedAt: 'desc' },
    })
    return records.map(r => new CoffeeshopStock(r as any))
  }

  async findByUserAndCoffee(userId: string, coffeeId: string): Promise<CoffeeshopStock | null> {
    const record = await this.prisma.coffeeshopStock.findUnique({
      where: { userId_coffeeId: { userId, coffeeId } },
      include: { coffee: coffeeInclude },
    })
    return record ? new CoffeeshopStock(record as any) : null
  }

  async upsert(data: UpsertCoffeeshopStockDTO): Promise<CoffeeshopStock> {
    const record = await this.prisma.coffeeshopStock.upsert({
      where: { userId_coffeeId: { userId: data.userId, coffeeId: data.coffeeId } },
      create: { userId: data.userId, coffeeId: data.coffeeId, quantity: data.quantity, alertAt: data.alertAt },
      update: { quantity: data.quantity, alertAt: data.alertAt },
      include: { coffee: coffeeInclude },
    })
    return new CoffeeshopStock(record as any)
  }

  async addQuantity(userId: string, coffeeId: string, amount: number): Promise<void> {
    await this.prisma.coffeeshopStock.upsert({
      where: { userId_coffeeId: { userId, coffeeId } },
      create: { userId, coffeeId, quantity: amount },
      update: { quantity: { increment: amount } },
    })
  }

  async listBySupplierId(supplierId: string): Promise<CoffeeshopStockForSupplierRow[]> {
    const records = await this.prisma.coffeeshopStock.findMany({
      where: { coffee: { supplierId } },
      include: {
        user: { select: { id: true, name: true, email: true, city: true, state: true } },
        coffee: { select: { id: true, name: true } },
      },
      orderBy: [{ userId: 'asc' }, { updatedAt: 'desc' }],
    })

    return records.map(r => ({
      coffeeshopId: r.user.id,
      coffeeshopName: r.user.name,
      coffeeshopEmail: r.user.email,
      city: r.user.city ?? null,
      state: r.user.state ?? null,
      coffeeId: r.coffee.id,
      coffeeName: r.coffee.name,
      quantity: r.quantity,
      alertAt: r.alertAt,
      isLow: r.alertAt != null && r.quantity <= r.alertAt,
      lastUpdated: r.updatedAt,
    }))
  }
}

import { PrismaClient } from '@prisma/client'
import { PartnerStockRepository } from '@/repositories/partner-stock-repository'
import { PartnerStockResult, SupplierStockItem, CoffeeshopStockItem } from '@/use-cases/get-partner-stock'

export class PrismaPartnerStockRepository implements PartnerStockRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<PartnerStockResult> {
    const [suppliersRaw, coffeeshopStocksRaw] = await Promise.all([
      this.prisma.supplier.findMany({
        where: { deletedAt: null },
        include: {
          coffees: {
            where: { deletedAt: null },
            select: {
              id: true,
              name: true,
              stock: true,
              pricePerKg: true,
              packagePrice: true,
              region: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.coffeeshopStock.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, city: true, state: true } },
          coffee: {
            select: {
              id: true,
              name: true,
              supplier: { select: { name: true } },
            },
          },
        },
        orderBy: [{ userId: 'asc' }, { updatedAt: 'desc' }],
      }),
    ])

    const suppliers: SupplierStockItem[] = suppliersRaw.map(s => ({
      supplierId: s.id,
      supplierName: s.name,
      supplierType: s.supplierType,
      coffeeCount: s.coffees.length,
      coffees: s.coffees.map(c => ({
        id: c.id,
        name: c.name,
        stock: c.stock,
        pricePerKg: c.pricePerKg,
        packagePrice: c.packagePrice,
        region: c.region ?? '',
        isActive: true,
      })),
    }))

    const grouped = new Map<string, CoffeeshopStockItem>()
    for (const s of coffeeshopStocksRaw) {
      const uid = s.user.id
      if (!grouped.has(uid)) {
        grouped.set(uid, {
          userId: uid,
          userName: s.user.name,
          userEmail: s.user.email,
          city: s.user.city ?? null,
          state: s.user.state ?? null,
          stockCount: 0,
          stocks: [],
        })
      }
      const entry = grouped.get(uid)!
      entry.stockCount++
      entry.stocks.push({
        coffeeId: s.coffeeId,
        coffeeName: s.coffee.name,
        supplierName: s.coffee.supplier?.name ?? '—',
        quantity: s.quantity,
        alertAt: s.alertAt,
        isLow: s.alertAt != null && s.quantity <= s.alertAt,
      })
    }

    return { suppliers, coffeeshops: Array.from(grouped.values()) }
  }
}

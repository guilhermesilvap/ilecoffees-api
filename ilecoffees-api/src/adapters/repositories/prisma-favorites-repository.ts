import { PrismaClient } from '@prisma/client'
import { Favorite, FavoriteData } from '@/entities/favorite'
import { FavoritesRepository } from '@/repositories/favorites-repository'

export class PrismaFavoritesRepository implements FavoritesRepository {
  constructor(private prisma: PrismaClient) {}

  private readonly includeRelations = {
    coffee: {
      select: {
        id: true,
        name: true,
        photoUrl: true,
        packagePrice: true,
        packagePriceCoffeeshop: true,
        pricePerKg: true,
        saleType: true,
        supplierId: true,
        supplier: { select: { id: true, name: true } },
      },
    },
  }

  async add(userId: string, coffeeId: string): Promise<Favorite> {
    const record = await this.prisma.favorite.upsert({
      where: { userId_coffeeId: { userId, coffeeId } },
      create: { userId, coffeeId },
      update: {},
      include: this.includeRelations,
    })
    return new Favorite(record as unknown as FavoriteData)
  }

  async remove(userId: string, coffeeId: string): Promise<void> {
    await this.prisma.favorite.deleteMany({ where: { userId, coffeeId } })
  }

  async list(userId: string): Promise<Favorite[]> {
    const records = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: this.includeRelations,
    })
    return records.map((r) => new Favorite(r as unknown as FavoriteData))
  }

  async findOne(userId: string, coffeeId: string): Promise<Favorite | null> {
    const record = await this.prisma.favorite.findUnique({
      where: { userId_coffeeId: { userId, coffeeId } },
    })
    if (!record) return null
    return new Favorite(record as unknown as FavoriteData)
  }
}

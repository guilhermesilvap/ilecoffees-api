import { PrismaClient } from '@prisma/client'
import { CartItem, CartItemData } from '@/entities/cart-item'
import { CartItemsRepository, AddCartItemDTO } from '@/repositories/cart-items-repository'

export class PrismaCartItemsRepository implements CartItemsRepository {
  constructor(private prisma: PrismaClient) {}

  async addOrUpdate(data: AddCartItemDTO): Promise<CartItem> {
    const existing = await this.prisma.cartItem.findFirst({
      where: { userId: data.userId, coffeeId: data.coffeeId },
    })

    if (existing) {
      const record = await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: data.quantity },
      })
      return new CartItem(record as unknown as CartItemData)
    }

    const record = await this.prisma.cartItem.create({ data })
    return new CartItem(record as unknown as CartItemData)
  }

  async remove(userId: string, coffeeId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({ where: { userId, coffeeId } })
  }

  async listByUser(userId: string): Promise<CartItem[]> {
    const records = await this.prisma.cartItem.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' },
      include: {
        coffee: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            saleType: true,
            pricePerKg: true,
            packagePrice: true,
            packageWeight: true,
          },
        },
      },
    })
    return records.map((r) => new CartItem(r as unknown as CartItemData))
  }

  async clearCart(userId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({ where: { userId } })
  }

  async findItem(userId: string, coffeeId: string): Promise<CartItem | null> {
    const record = await this.prisma.cartItem.findFirst({ where: { userId, coffeeId } })
    if (!record) return null
    return new CartItem(record as unknown as CartItemData)
  }
}

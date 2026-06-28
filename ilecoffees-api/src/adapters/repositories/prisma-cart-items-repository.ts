import { PrismaClient } from '@prisma/client'
import { CartItem, CartItemData } from '@/entities/cart-item'
import { CartItemsRepository, AddCartItemDTO, BuyerRef } from '@/repositories/cart-items-repository'

const COFFEE_SELECT = {
  id: true,
  name: true,
  photoUrl: true,
  saleType: true,
  pricePerKg: true,
  packagePrice: true,
  packageWeight: true,
}

export class PrismaCartItemsRepository implements CartItemsRepository {
  constructor(private prisma: PrismaClient) {}

  async addOrUpdate(data: AddCartItemDTO): Promise<CartItem> {
    let record: any
    if (data.supplierId) {
      record = await this.prisma.cartItem.upsert({
        where: { supplierId_coffeeId: { supplierId: data.supplierId, coffeeId: data.coffeeId } },
        update: { quantity: data.quantity },
        create: { supplierId: data.supplierId, coffeeId: data.coffeeId, quantity: data.quantity },
      })
    } else {
      record = await this.prisma.cartItem.upsert({
        where: { userId_coffeeId: { userId: data.userId!, coffeeId: data.coffeeId } },
        update: { quantity: data.quantity },
        create: { userId: data.userId!, coffeeId: data.coffeeId, quantity: data.quantity },
      })
    }
    return new CartItem(record as CartItemData)
  }

  async remove(buyer: BuyerRef, coffeeId: string): Promise<void> {
    if (buyer.supplierId) {
      await this.prisma.cartItem.deleteMany({ where: { supplierId: buyer.supplierId, coffeeId } })
    } else {
      await this.prisma.cartItem.deleteMany({ where: { userId: buyer.userId, coffeeId } })
    }
  }

  async listByBuyer(buyer: BuyerRef): Promise<CartItem[]> {
    const where = buyer.supplierId ? { supplierId: buyer.supplierId } : { userId: buyer.userId }
    const records = await this.prisma.cartItem.findMany({
      where,
      orderBy: { addedAt: 'desc' },
      include: { coffee: { select: COFFEE_SELECT } },
    })
    return records.map((r) => new CartItem(r as unknown as CartItemData))
  }

  async clearCart(buyer: BuyerRef): Promise<void> {
    if (buyer.supplierId) {
      await this.prisma.cartItem.deleteMany({ where: { supplierId: buyer.supplierId } })
    } else {
      await this.prisma.cartItem.deleteMany({ where: { userId: buyer.userId } })
    }
  }

  async findItem(buyer: BuyerRef, coffeeId: string): Promise<CartItem | null> {
    let record: any
    if (buyer.supplierId) {
      record = await this.prisma.cartItem.findUnique({
        where: { supplierId_coffeeId: { supplierId: buyer.supplierId, coffeeId } },
      })
    } else {
      record = await this.prisma.cartItem.findUnique({
        where: { userId_coffeeId: { userId: buyer.userId!, coffeeId } },
      })
    }
    if (!record) return null
    return new CartItem(record as CartItemData)
  }
}

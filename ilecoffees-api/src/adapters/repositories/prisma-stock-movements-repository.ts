import { PrismaClient } from '@prisma/client'
import {
  StockMovementsRepository,
  StockMovement,
  CreateStockMovementDTO,
} from '@/repositories/stock-movements-repository'

export class PrismaStockMovementsRepository implements StockMovementsRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateStockMovementDTO): Promise<StockMovement> {
    return this.prisma.stockMovement.create({
      data,
      include: { coffee: { select: { name: true, supplierId: true } } },
    }) as unknown as StockMovement
  }

  async listByCoffee(coffeeId: string): Promise<StockMovement[]> {
    return this.prisma.stockMovement.findMany({
      where: { coffeeId },
      include: { coffee: { select: { name: true, supplierId: true } } },
      orderBy: { createdAt: 'desc' },
    }) as unknown as StockMovement[]
  }

  async listBySupplier(supplierId: string): Promise<StockMovement[]> {
    return this.prisma.stockMovement.findMany({
      where: { coffee: { supplierId, deletedAt: null } },
      include: { coffee: { select: { name: true, supplierId: true } } },
      orderBy: { createdAt: 'desc' },
    }) as unknown as StockMovement[]
  }
}

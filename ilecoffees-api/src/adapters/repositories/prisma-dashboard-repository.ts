import { PrismaClient, Prisma } from '@prisma/client'
import {
  DashboardRepository,
  DashboardStats,
  RevenuePeriod,
  RevenuePeriodEntry,
} from '@/repositories/dashboard-repository'

export class PrismaDashboardRepository implements DashboardRepository {
  constructor(private prisma: PrismaClient) {}

  async getStats(): Promise<DashboardStats> {
    const [
      userCount,
      supplierGroups,
      suppliersWithoutPlan,
      coffeeCount,
      lowStockCount,
      ordersByStatus,
      ordersByType,
      confirmedRevenue,
      pendingRevenue,
      revenueByMethod,
      failedPaymentCount,
      courseCount,
      enrollmentCount,
      subscriptionCount,
      cartAbandonedCount,
      coursesByLevel,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),

      this.prisma.supplier.groupBy({
        by: ['isActive'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),

      this.prisma.supplier.count({ where: { deletedAt: null, planId: null } }),

      this.prisma.coffee.count({ where: { deletedAt: null } }),

      this.prisma.coffee.count({
        where: { deletedAt: null, saleType: 'KG', stock: { lte: 10, not: null } },
      }),

      this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),

      this.prisma.order.groupBy({ by: ['type'], _count: { _all: true } }),

      this.prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),

      this.prisma.payment.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true } }),

      this.prisma.payment.groupBy({
        by: ['method'],
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),

      this.prisma.payment.count({ where: { status: 'FAILED' } }),

      this.prisma.course.count({ where: { deletedAt: null } }),

      this.prisma.courseEnrollment.count(),

      this.prisma.subscription.count({ where: { deletedAt: null } }),

      this.prisma.user.count({
        where: {
          deletedAt: null,
          cartItems: { some: {} },
          Order: { none: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } } },
        },
      }),

      this.prisma.course.findMany({
        where: { deletedAt: null },
        select: { level: true, _count: { select: { enrollments: true } } },
      }),
    ])

    const activeSuppliers = supplierGroups.find((g) => g.isActive)?._count._all ?? 0
    const inactiveSuppliers = supplierGroups.find((g) => !g.isActive)?._count._all ?? 0

    const byStatus = ordersByStatus.reduce<Record<string, number>>((acc, g) => {
      acc[g.status] = g._count._all
      return acc
    }, {})

    const byType = ordersByType.reduce<Record<string, number>>((acc, g) => {
      acc[g.type] = g._count._all
      return acc
    }, {})

    const byMethod = revenueByMethod.reduce<Record<string, number>>((acc, g) => {
      acc[g.method] = g._sum.amount ?? 0
      return acc
    }, {})

    const byLevel = coursesByLevel.reduce<Record<string, number>>((acc, c) => {
      acc[c.level] = (acc[c.level] ?? 0) + c._count.enrollments
      return acc
    }, {})

    return {
      users: { total: userCount },
      suppliers: {
        total: activeSuppliers + inactiveSuppliers,
        active: activeSuppliers,
        inactive: inactiveSuppliers,
        withoutPlan: suppliersWithoutPlan,
      },
      coffees: { total: coffeeCount, lowStock: lowStockCount },
      orders: {
        total: Object.values(byStatus).reduce((a, b) => a + b, 0),
        byStatus,
        byType,
      },
      revenue: {
        confirmed: confirmedRevenue._sum.amount ?? 0,
        pending: pendingRevenue._sum.amount ?? 0,
        failedPayments: failedPaymentCount,
        byMethod,
      },
      courses: { total: courseCount, totalEnrollments: enrollmentCount, byLevel },
      subscriptions: { total: subscriptionCount },
      cart: { usersWithAbandonedCart: cartAbandonedCount },
    }
  }

  async getRevenueByPeriod(period: RevenuePeriod, limit: number): Promise<RevenuePeriodEntry[]> {
    const trunc = period === 'monthly' ? 'month' : 'week'
    const rows = await this.prisma.$queryRaw<Array<{ period: Date; total: number; count: bigint }>>(
      Prisma.sql`
        SELECT
          date_trunc(${trunc}, "paidAt") AS period,
          SUM(amount)                    AS total,
          COUNT(*)                       AS count
        FROM "Payment"
        WHERE status = 'SUCCESS'
          AND "paidAt" IS NOT NULL
        GROUP BY period
        ORDER BY period DESC
        LIMIT ${limit}
      `,
    )
    return rows.map((r) => ({ period: r.period, total: Number(r.total), count: Number(r.count) }))
  }
}

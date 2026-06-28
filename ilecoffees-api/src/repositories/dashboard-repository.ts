export type DashboardStats = {
  users: {
    total: number
  }
  suppliers: {
    total: number
    active: number
    inactive: number
    withoutPlan: number
  }
  coffees: {
    total: number
    lowStock: number
  }
  orders: {
    total: number
    byStatus: Record<string, number>
    byType: Record<string, number>
  }
  revenue: {
    confirmed: number
    pending: number
    failedPayments: number
    byMethod: Record<string, number>
  }
  courses: {
    total: number
    totalEnrollments: number
    byLevel: Record<string, number>
  }
  subscriptions: {
    total: number
  }
  cart: {
    usersWithAbandonedCart: number
  }
}

export type RevenuePeriod = 'monthly' | 'weekly'

export type RevenuePeriodEntry = {
  period: Date
  total: number
  count: number
}

export interface DashboardRepository {
  getStats(): Promise<DashboardStats>
  getRevenueByPeriod(period: RevenuePeriod, limit: number): Promise<RevenuePeriodEntry[]>
}

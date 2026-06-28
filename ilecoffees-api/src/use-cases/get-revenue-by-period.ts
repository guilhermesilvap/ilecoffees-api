import { DashboardRepository, RevenuePeriod, RevenuePeriodEntry } from '@/repositories/dashboard-repository'

export class GetRevenueByPeriodUseCase {
  constructor(private dashboardRepository: DashboardRepository) {}

  async execute(period: RevenuePeriod = 'monthly', limit = 12): Promise<RevenuePeriodEntry[]> {
    return this.dashboardRepository.getRevenueByPeriod(period, limit)
  }
}

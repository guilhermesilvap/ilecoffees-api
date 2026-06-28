import { DashboardRepository, DashboardStats } from '@/repositories/dashboard-repository'

export class GetDashboardUseCase {
  constructor(private dashboardRepository: DashboardRepository) {}

  async execute(): Promise<DashboardStats> {
    return this.dashboardRepository.getStats()
  }
}

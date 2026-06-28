import { PartnerStockResult } from '@/use-cases/get-partner-stock'

export interface PartnerStockRepository {
  getAll(): Promise<PartnerStockResult>
}

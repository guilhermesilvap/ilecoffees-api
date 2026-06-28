import { Supplier } from '@/entities/supplier'
import { SuppliersRepository } from '@/repositories/suppliers-repository'

export interface ListSuppliersInput {
  isActive?: boolean
  page?: number
  limit?: number
}

export interface ListSuppliersResult {
  items: Supplier[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class ListSuppliersUseCase {
  constructor(private suppliersRepository: SuppliersRepository) {}

  async execute(input?: ListSuppliersInput): Promise<ListSuppliersResult> {
    const page = Math.max(1, input?.page ?? 1)
    const limit = Math.min(100, Math.max(1, input?.limit ?? 30))
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      this.suppliersRepository.list({ isActive: input?.isActive, skip, take: limit }),
      this.suppliersRepository.count({ isActive: input?.isActive }),
    ])

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }
}

import { Supplier } from '@/entities/supplier'
import { SuppliersRepository } from '@/repositories/suppliers-repository'

export class ListSuppliersUseCase {
  constructor(private suppliersRepository: SuppliersRepository) {}

  async execute(): Promise<Supplier[]> {
    return this.suppliersRepository.list()
  }
}

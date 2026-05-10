import { Coffee } from '@/entities/coffee'
import { CoffeesRepository, ListCoffeesFilters } from '@/repositories/coffees-repository'

export class ListCoffeesUseCase {
  constructor(private coffeesRepository: CoffeesRepository) {}

  async execute(filters: ListCoffeesFilters): Promise<Coffee[]> {
    return this.coffeesRepository.list(filters)
  }
}

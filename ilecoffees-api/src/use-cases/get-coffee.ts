import { Coffee } from '@/entities/coffee'
import { CoffeesRepository } from '@/repositories/coffees-repository'
import { AppError } from '@/utils/AppError'

export class GetCoffeeUseCase {
  constructor(private coffeesRepository: CoffeesRepository) {}

  async execute(id: string): Promise<Coffee> {
    const coffee = await this.coffeesRepository.findById(id)
    if (!coffee) throw new AppError('Café não encontrado', 404)
    return coffee
  }
}

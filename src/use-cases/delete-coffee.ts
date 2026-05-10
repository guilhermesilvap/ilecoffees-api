import { AppError } from '@/utils/AppError'
import { CoffeesRepository } from '@/repositories/coffees-repository'

export class DeleteCoffeeUseCase {
  constructor(private coffeesRepository: CoffeesRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.coffeesRepository.findById(id)
    if (!existing) throw new AppError('Café inexistente', 404)

    await this.coffeesRepository.softDelete(id)
  }
}

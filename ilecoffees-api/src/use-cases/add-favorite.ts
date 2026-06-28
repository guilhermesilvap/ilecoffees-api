import { AppError } from '@/utils/AppError'
import { Favorite } from '@/entities/favorite'
import { FavoritesRepository } from '@/repositories/favorites-repository'
import { CoffeesRepository } from '@/repositories/coffees-repository'

export class AddFavoriteUseCase {
  constructor(
    private favoritesRepository: FavoritesRepository,
    private coffeesRepository: CoffeesRepository,
  ) {}

  async execute(userId: string, coffeeId: string): Promise<Favorite> {
    const coffee = await this.coffeesRepository.findById(coffeeId)
    if (!coffee) throw new AppError('Café não encontrado', 404)

    return this.favoritesRepository.add(userId, coffeeId)
  }
}

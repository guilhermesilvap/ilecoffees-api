import { FavoritesRepository } from '@/repositories/favorites-repository'

export class RemoveFavoriteUseCase {
  constructor(private favoritesRepository: FavoritesRepository) {}

  async execute(userId: string, coffeeId: string): Promise<void> {
    await this.favoritesRepository.remove(userId, coffeeId)
  }
}

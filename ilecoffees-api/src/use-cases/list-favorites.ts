import { Favorite } from '@/entities/favorite'
import { FavoritesRepository } from '@/repositories/favorites-repository'

export class ListFavoritesUseCase {
  constructor(private favoritesRepository: FavoritesRepository) {}

  async execute(userId: string): Promise<Favorite[]> {
    return this.favoritesRepository.list(userId)
  }
}

import { Favorite } from '@/entities/favorite'

export interface FavoritesRepository {
  add(userId: string, coffeeId: string): Promise<Favorite>
  remove(userId: string, coffeeId: string): Promise<void>
  list(userId: string): Promise<Favorite[]>
  findOne(userId: string, coffeeId: string): Promise<Favorite | null>
}

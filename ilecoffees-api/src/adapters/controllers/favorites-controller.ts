import { Request, Response } from 'express'
import { AppError } from '@/utils/AppError'
import { addFavoriteSchema, removeFavoriteSchema } from '@/adapters/validators/favorite-schema'
import { AddFavoriteUseCase } from '@/use-cases/add-favorite'
import { RemoveFavoriteUseCase } from '@/use-cases/remove-favorite'
import { ListFavoritesUseCase } from '@/use-cases/list-favorites'

export class FavoritesController {
  constructor(
    private addFavoriteUseCase: AddFavoriteUseCase,
    private removeFavoriteUseCase: RemoveFavoriteUseCase,
    private listFavoritesUseCase: ListFavoritesUseCase,
  ) {}

  private requireUser(req: Request) {
    if (req.user?.type !== 'USER') throw new AppError('Apenas usuários podem gerenciar favoritos', 403)
    return req.user.id
  }

  add = async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUser(req)
    const { coffeeId } = addFavoriteSchema.parse(req.body)
    const favorite = await this.addFavoriteUseCase.execute(userId, coffeeId)
    res.status(201).json(favorite)
  }

  remove = async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUser(req)
    const { coffeeId } = removeFavoriteSchema.parse(req.params)
    await this.removeFavoriteUseCase.execute(userId, coffeeId)
    res.status(204).send()
  }

  index = async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUser(req)
    const favorites = await this.listFavoritesUseCase.execute(userId)
    res.status(200).json(favorites)
  }
}

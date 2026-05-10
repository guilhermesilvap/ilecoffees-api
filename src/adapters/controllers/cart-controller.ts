import { Request, Response } from 'express'
import { AppError } from '@/utils/AppError'
import { addToCartSchema, removeFromCartSchema } from '@/adapters/validators/cart-schema'
import { AddToCartUseCase } from '@/use-cases/add-to-cart'
import { RemoveFromCartUseCase } from '@/use-cases/remove-from-cart'
import { ListCartUseCase } from '@/use-cases/list-cart'

export class CartController {
  constructor(
    private addToCartUseCase: AddToCartUseCase,
    private removeFromCartUseCase: RemoveFromCartUseCase,
    private listCartUseCase: ListCartUseCase,
  ) {}

  add = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') {
      throw new AppError('Apenas usuários podem adicionar itens ao carrinho', 403)
    }

    const { coffeeId, quantity } = addToCartSchema.parse(req.body)
    const item = await this.addToCartUseCase.execute({ userId: req.user.id, coffeeId, quantity })

    res.status(201).json(item)
  }

  remove = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') {
      throw new AppError('Apenas usuários podem remover itens do carrinho', 403)
    }

    const { coffeeId } = removeFromCartSchema.parse(req.params)
    await this.removeFromCartUseCase.execute(req.user.id, coffeeId)

    res.status(204).send()
  }

  index = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') {
      throw new AppError('Apenas usuários têm carrinho', 403)
    }

    const items = await this.listCartUseCase.execute(req.user.id)

    res.status(200).json(items)
  }
}

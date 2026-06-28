import { Request, Response } from 'express'
import { AppError } from '@/utils/AppError'
import { addToCartSchema, removeFromCartSchema, updateCartItemSchema } from '@/adapters/validators/cart-schema'
import { AddToCartUseCase } from '@/use-cases/add-to-cart'
import { RemoveFromCartUseCase } from '@/use-cases/remove-from-cart'
import { ListCartUseCase } from '@/use-cases/list-cart'
import { UpdateCartItemUseCase } from '@/use-cases/update-cart-item'

export class CartController {
  constructor(
    private addToCartUseCase: AddToCartUseCase,
    private removeFromCartUseCase: RemoveFromCartUseCase,
    private listCartUseCase: ListCartUseCase,
    private updateCartItemUseCase: UpdateCartItemUseCase,
  ) {}

  private getBuyer(req: Request) {
    if (req.user?.type === 'SUPPLIER') return { supplierId: req.user.id }
    if (req.user?.type === 'USER') return { userId: req.user.id }
    throw new AppError('Apenas usuários e torrefadores podem usar o carrinho', 403)
  }

  add = async (req: Request, res: Response): Promise<void> => {
    const buyer = this.getBuyer(req)
    const { coffeeId, quantity } = addToCartSchema.parse(req.body)
    const accountType = req.user?.type === 'USER' ? req.user.accountType : undefined
    const item = await this.addToCartUseCase.execute({ ...buyer, coffeeId, quantity, accountType })
    res.status(201).json(item)
  }

  remove = async (req: Request, res: Response): Promise<void> => {
    const buyer = this.getBuyer(req)
    const { coffeeId } = removeFromCartSchema.parse(req.params)
    await this.removeFromCartUseCase.execute(buyer, coffeeId)
    res.status(204).send()
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const buyer = this.getBuyer(req)
    const { coffeeId } = removeFromCartSchema.parse(req.params)
    const { quantity } = updateCartItemSchema.parse(req.body)
    const item = await this.updateCartItemUseCase.execute({ buyer, coffeeId, quantity })
    res.status(200).json(item)
  }

  index = async (req: Request, res: Response): Promise<void> => {
    const buyer = this.getBuyer(req)
    const items = await this.listCartUseCase.execute(buyer)
    res.status(200).json(items)
  }
}

import { Request, Response } from 'express'
import { AppError } from '@/utils/AppError'
import { createSubscriptionOrderSchema } from '@/adapters/validators/order-schema'
import { CreateOrderUseCase } from '@/use-cases/create-order'
import { ListOrdersUseCase } from '@/use-cases/list-orders'
import { CancelOrderUseCase } from '@/use-cases/cancel-order'
import { GetOrderUseCase } from '@/use-cases/get-order'
import { CreateSubscriptionOrderUseCase } from '@/use-cases/create-subscription-order'

export class OrdersController {
  constructor(
    private createOrderUseCase: CreateOrderUseCase,
    private listOrdersUseCase: ListOrdersUseCase,
    private cancelOrderUseCase: CancelOrderUseCase,
    private getOrderUseCase: GetOrderUseCase,
    private createSubscriptionOrderUseCase: CreateSubscriptionOrderUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') throw new AppError('Apenas usuários podem criar pedidos', 403)
    const orders = await this.createOrderUseCase.execute(req.user.id)
    res.status(201).json(orders)
  }

  subscribe = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') throw new AppError('Apenas usuários podem assinar planos', 403)
    const { subscriptionId, billingCycle } = createSubscriptionOrderSchema.parse(req.body)
    const order = await this.createSubscriptionOrderUseCase.execute({
      userId: req.user.id,
      subscriptionId,
      billingCycle,
    })
    res.status(201).json(order)
  }

  index = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') throw new AppError('Apenas usuários podem listar pedidos', 403)
    const orders = await this.listOrdersUseCase.execute(req.user.id)
    res.status(200).json(orders)
  }

  show = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') throw new AppError('Apenas usuários podem ver pedidos', 403)
    const order = await this.getOrderUseCase.execute(req.params.id, req.user.id)
    res.status(200).json(order)
  }

  cancel = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') throw new AppError('Apenas usuários podem cancelar pedidos', 403)
    const order = await this.cancelOrderUseCase.execute(req.params.id, req.user.id)
    res.status(200).json(order)
  }
}

import { Request, Response } from 'express'
import { AppError } from '@/utils/AppError'
import {
  subscriptionCreateSchema,
  subscriptionUpdateSchema,
  subscriptionQuerySchema,
} from '@/adapters/validators/subscription-schema'
import { CreateSubscriptionUseCase } from '@/use-cases/create-subscription'
import { UpdateSubscriptionUseCase } from '@/use-cases/update-subscription'
import { DeleteSubscriptionUseCase } from '@/use-cases/delete-subscription'
import { ListSubscriptionsUseCase } from '@/use-cases/list-subscriptions'
import { GetSubscriptionUseCase } from '@/use-cases/get-subscription'

export class SubscriptionsController {
  constructor(
    private createSubscriptionUseCase: CreateSubscriptionUseCase,
    private updateSubscriptionUseCase: UpdateSubscriptionUseCase,
    private deleteSubscriptionUseCase: DeleteSubscriptionUseCase,
    private listSubscriptionsUseCase: ListSubscriptionsUseCase,
    private getSubscriptionUseCase: GetSubscriptionUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'SUPPLIER') {
      throw new AppError('Você não tem permissão para criar assinaturas', 403)
    }

    const data = subscriptionCreateSchema.parse(req.body)
    const subscription = await this.createSubscriptionUseCase.execute({
      ...data,
      supplierId: req.user.id,
    })

    res.status(201).json(subscription)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'SUPPLIER') {
      throw new AppError('Você não tem permissão para atualizar assinaturas', 403)
    }

    const { id } = req.params
    const data = subscriptionUpdateSchema.parse(req.body)

    const subscription = await this.updateSubscriptionUseCase.execute(id, {
      ...data,
      supplierId: req.user.id,
    })

    res.status(200).json(subscription)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'SUPPLIER') {
      throw new AppError('Você não tem permissão para deletar assinaturas', 403)
    }

    const { id } = req.params
    await this.deleteSubscriptionUseCase.execute(id, req.user.id)

    res.status(204).send()
  }

  index = async (req: Request, res: Response): Promise<void> => {
    const filters = subscriptionQuerySchema.parse(req.query)

    if (req.user?.type === 'SUPPLIER') {
      filters.supplierId = req.user.id
    }

    const subscriptions = await this.listSubscriptionsUseCase.execute(filters)

    res.status(200).json(subscriptions)
  }

  show = async (req: Request, res: Response): Promise<void> => {
    const subscription = await this.getSubscriptionUseCase.execute(req.params.id)
    res.status(200).json(subscription)
  }
}

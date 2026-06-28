import { Request, Response } from 'express'
import { AppError } from '@/utils/AppError'
import { createOrderSchema, createSubscriptionOrderSchema } from '@/adapters/validators/order-schema'
import { CreateOrderUseCase } from '@/use-cases/create-order'
import { ListOrdersUseCase } from '@/use-cases/list-orders'
import { ListSupplierOrdersUseCase } from '@/use-cases/list-supplier-orders'
import { CancelOrderUseCase } from '@/use-cases/cancel-order'
import { GetOrderUseCase } from '@/use-cases/get-order'
import { CreateSubscriptionOrderUseCase } from '@/use-cases/create-subscription-order'
import { TrackOrderUseCase } from '@/use-cases/track-order'
import { PauseSubscriptionUseCase } from '@/use-cases/pause-subscription'
import { ResumeSubscriptionUseCase } from '@/use-cases/resume-subscription'
import { ListSubscriptionDeliveriesUseCase } from '@/use-cases/list-subscription-deliveries'
import { CreateB2BOrderUseCase } from '@/use-cases/create-b2b-order'
import { OrdersRepository } from '@/repositories/orders-repository'

export class OrdersController {
  constructor(
    private createOrderUseCase: CreateOrderUseCase,
    private listOrdersUseCase: ListOrdersUseCase,
    private listSupplierOrdersUseCase: ListSupplierOrdersUseCase,
    private cancelOrderUseCase: CancelOrderUseCase,
    private getOrderUseCase: GetOrderUseCase,
    private createSubscriptionOrderUseCase: CreateSubscriptionOrderUseCase,
    private trackOrderUseCase: TrackOrderUseCase,
    private pauseSubscriptionUseCase: PauseSubscriptionUseCase,
    private resumeSubscriptionUseCase: ResumeSubscriptionUseCase,
    private listSubscriptionDeliveriesUseCase: ListSubscriptionDeliveriesUseCase,
    private createB2BOrderUseCase: CreateB2BOrderUseCase,
    private ordersRepository: OrdersRepository,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') throw new AppError('Apenas usuários podem criar pedidos', 403)
    const { deliveryCep, shippingChoices } = createOrderSchema.parse(req.body)
    const orders = await this.createOrderUseCase.execute({
      userId: req.user.id,
      deliveryCep,
      shippingChoices,
    })
    res.status(201).json(orders)
  }

  subscribe = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') throw new AppError('Apenas usuários podem assinar planos', 403)
    const { subscriptionId, billingCycle } = createSubscriptionOrderSchema.parse(req.body)
    const order = await this.createSubscriptionOrderUseCase.execute({
      userId: req.user.id,
      subscriptionId,
      billingCycle,
      accountType: req.user.accountType,
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

  supplierIndex = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'SUPPLIER') throw new AppError('Acesso restrito a fornecedores', 403)
    const orders = await this.listSupplierOrdersUseCase.execute(req.user.id)
    res.status(200).json(orders)
  }

  supplierB2BCreate = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'SUPPLIER') throw new AppError('Acesso restrito a torrefadores', 403)
    if (req.user?.supplierType !== 'ROASTER') throw new AppError('Apenas torrefadores podem realizar compras B2B', 403)
    const { deliveryCep, shippingChoices } = createOrderSchema.parse(req.body)
    const orders = await this.createB2BOrderUseCase.execute({
      supplierId: req.user.id,
      deliveryCep: deliveryCep ?? '',
      shippingChoices,
    })
    res.status(201).json(orders)
  }

  supplierB2BIndex = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'SUPPLIER') throw new AppError('Acesso restrito a torrefadores', 403)
    const orders = await this.ordersRepository.listByBuyerSupplier(req.user.id)
    res.status(200).json(orders)
  }

  track = async (req: Request, res: Response): Promise<void> => {
    const result = await this.trackOrderUseCase.execute(req.params.id)
    res.status(200).json(result)
  }

  pause = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') throw new AppError('Apenas usuários podem pausar assinaturas', 403)
    const order = await this.pauseSubscriptionUseCase.execute(req.params.id, req.user.id)
    res.status(200).json(order)
  }

  resume = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') throw new AppError('Apenas usuários podem retomar assinaturas', 403)
    const order = await this.resumeSubscriptionUseCase.execute(req.params.id, req.user.id)
    res.status(200).json(order)
  }

  deliveries = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') throw new AppError('Acesso negado', 403)
    const items = await this.listSubscriptionDeliveriesUseCase.execute(req.params.id, req.user.id)
    res.status(200).json(items)
  }
}

import { Request, Response } from 'express'
import { adminCreateSchema } from '@/adapters/validators/admin-schema'
import { updateOrderStatusSchema } from '@/adapters/validators/order-schema'
import { CreateAdminUseCase } from '@/use-cases/create-admin'
import { ListUsersUseCase } from '@/use-cases/list-users'
import { DeleteUserUseCase } from '@/use-cases/delete-user'
import { ListSuppliersUseCase } from '@/use-cases/list-suppliers'
import { DeleteSupplierUseCase } from '@/use-cases/delete-supplier'
import { DeleteCoffeeUseCase } from '@/use-cases/delete-coffee'
import { DeleteSubscriptionUseCase } from '@/use-cases/delete-subscription'
import { ListAllOrdersUseCase } from '@/use-cases/list-all-orders'
import { UpdateOrderStatusUseCase } from '@/use-cases/update-order-status'

export class AdminsController {
  constructor(
    private createAdminUseCase: CreateAdminUseCase,
    private listUsersUseCase: ListUsersUseCase,
    private deleteUserUseCase: DeleteUserUseCase,
    private listSuppliersUseCase: ListSuppliersUseCase,
    private deleteSupplierUseCase: DeleteSupplierUseCase,
    private deleteCoffeeUseCase: DeleteCoffeeUseCase,
    private deleteSubscriptionUseCase: DeleteSubscriptionUseCase,
    private listAllOrdersUseCase: ListAllOrdersUseCase,
    private updateOrderStatusUseCase: UpdateOrderStatusUseCase,
  ) {}

  createAdmin = async (req: Request, res: Response): Promise<void> => {
    const data = adminCreateSchema.parse(req.body)
    const admin = await this.createAdminUseCase.execute(data)
    res.status(201).json(admin)
  }

  listUsers = async (_req: Request, res: Response): Promise<void> => {
    const users = await this.listUsersUseCase.execute()
    res.status(200).json(users)
  }

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    await this.deleteUserUseCase.execute(req.params.id)
    res.status(204).send()
  }

  listSuppliers = async (_req: Request, res: Response): Promise<void> => {
    const suppliers = await this.listSuppliersUseCase.execute()
    res.status(200).json(suppliers)
  }

  deleteSupplier = async (req: Request, res: Response): Promise<void> => {
    await this.deleteSupplierUseCase.execute(req.params.id)
    res.status(204).send()
  }

  deleteCoffee = async (req: Request, res: Response): Promise<void> => {
    await this.deleteCoffeeUseCase.execute(req.params.id)
    res.status(204).send()
  }

  deleteSubscription = async (req: Request, res: Response): Promise<void> => {
    await this.deleteSubscriptionUseCase.execute(req.params.id)
    res.status(204).send()
  }

  listOrders = async (_req: Request, res: Response): Promise<void> => {
    const orders = await this.listAllOrdersUseCase.execute()
    res.status(200).json(orders)
  }

  updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    const { status } = updateOrderStatusSchema.parse(req.body)
    const order = await this.updateOrderStatusUseCase.execute({ id: req.params.id, status })
    res.status(200).json(order)
  }
}

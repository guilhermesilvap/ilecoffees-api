import { Request, Response } from 'express'
import { adminCreateSchema } from '@/adapters/validators/admin-schema'
import { updateOrderStatusSchema, listAllOrdersQuerySchema } from '@/adapters/validators/order-schema'
import {
  supplierPlanCreateSchema,
  supplierPlanUpdateSchema,
  assignSupplierPlanSchema,
  toggleSupplierStatusSchema,
  listSuppliersQuerySchema,
} from '@/adapters/validators/supplier-plan-schema'
import { CreateAdminUseCase } from '@/use-cases/create-admin'
import { ListUsersUseCase } from '@/use-cases/list-users'
import { DeleteUserUseCase } from '@/use-cases/delete-user'
import { ListSuppliersUseCase } from '@/use-cases/list-suppliers'
import { DeleteSupplierUseCase } from '@/use-cases/delete-supplier'
import { DeleteCoffeeUseCase } from '@/use-cases/delete-coffee'
import { DeleteSubscriptionUseCase } from '@/use-cases/delete-subscription'
import { ListAllOrdersUseCase } from '@/use-cases/list-all-orders'
import { UpdateOrderStatusUseCase } from '@/use-cases/update-order-status'
import { CreateSupplierPlanUseCase } from '@/use-cases/create-supplier-plan'
import { UpdateSupplierPlanUseCase } from '@/use-cases/update-supplier-plan'
import { DeleteSupplierPlanUseCase } from '@/use-cases/delete-supplier-plan'
import { ListSupplierPlansUseCase } from '@/use-cases/list-supplier-plans'
import { ToggleSupplierStatusUseCase } from '@/use-cases/toggle-supplier-status'
import { AssignSupplierPlanUseCase } from '@/use-cases/assign-supplier-plan'
import { GetDashboardUseCase } from '@/use-cases/get-dashboard'
import { GetRevenueByPeriodUseCase } from '@/use-cases/get-revenue-by-period'
import { revenuePeriodQuerySchema } from '@/adapters/validators/review-schema'
import { GetPartnerStockUseCase } from '@/use-cases/get-partner-stock'

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
    private createSupplierPlanUseCase: CreateSupplierPlanUseCase,
    private updateSupplierPlanUseCase: UpdateSupplierPlanUseCase,
    private deleteSupplierPlanUseCase: DeleteSupplierPlanUseCase,
    private listSupplierPlansUseCase: ListSupplierPlansUseCase,
    private toggleSupplierStatusUseCase: ToggleSupplierStatusUseCase,
    private assignSupplierPlanUseCase: AssignSupplierPlanUseCase,
    private getDashboardUseCase: GetDashboardUseCase,
    private getRevenueByPeriodUseCase: GetRevenueByPeriodUseCase,
    private getPartnerStockUseCase: GetPartnerStockUseCase,
  ) {}

  createAdmin = async (req: Request, res: Response): Promise<void> => {
    const data = adminCreateSchema.parse(req.body)
    const admin = await this.createAdminUseCase.execute(data)
    res.status(201).json(admin)
  }

  listUsers = async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page) || 1
    const limit = Math.min(Number(req.query.limit) || 30, 100)
    const result = await this.listUsersUseCase.execute({ page, limit })
    res.status(200).json(result)
  }

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    await this.deleteUserUseCase.execute(req.params.id)
    res.status(204).send()
  }

  listSuppliers = async (req: Request, res: Response): Promise<void> => {
    const { isActive, page, limit } = listSuppliersQuerySchema.parse(req.query)
    const result = await this.listSuppliersUseCase.execute({ isActive, page: page ?? 1, limit: limit ?? 30 })
    res.status(200).json(result)
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

  listOrders = async (req: Request, res: Response): Promise<void> => {
    const { status, type, page, limit } = listAllOrdersQuerySchema.parse(req.query)
    const result = await this.listAllOrdersUseCase.execute({ status, type, page: page ?? 1, limit: limit ?? 30 })
    res.status(200).json(result)
  }

  getDashboard = async (_req: Request, res: Response): Promise<void> => {
    const stats = await this.getDashboardUseCase.execute()
    res.status(200).json(stats)
  }

  getRevenueByPeriod = async (req: Request, res: Response): Promise<void> => {
    const { period, limit } = revenuePeriodQuerySchema.parse(req.query)
    const data = await this.getRevenueByPeriodUseCase.execute(period, limit)
    res.status(200).json(data)
  }

  updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    const { status, trackingCode } = updateOrderStatusSchema.parse(req.body)
    const order = await this.updateOrderStatusUseCase.execute({ id: req.params.id, status, trackingCode })
    res.status(200).json(order)
  }

  createSupplierPlan = async (req: Request, res: Response): Promise<void> => {
    const data = supplierPlanCreateSchema.parse(req.body)
    const plan = await this.createSupplierPlanUseCase.execute(data)
    res.status(201).json(plan)
  }

  updateSupplierPlan = async (req: Request, res: Response): Promise<void> => {
    const data = supplierPlanUpdateSchema.parse(req.body)
    const plan = await this.updateSupplierPlanUseCase.execute(req.params.id, data)
    res.status(200).json(plan)
  }

  deleteSupplierPlan = async (req: Request, res: Response): Promise<void> => {
    await this.deleteSupplierPlanUseCase.execute(req.params.id)
    res.status(204).send()
  }

  listSupplierPlans = async (_req: Request, res: Response): Promise<void> => {
    const plans = await this.listSupplierPlansUseCase.execute()
    res.status(200).json(plans)
  }

  toggleSupplierStatus = async (req: Request, res: Response): Promise<void> => {
    const { isActive } = toggleSupplierStatusSchema.parse(req.body)
    const supplier = await this.toggleSupplierStatusUseCase.execute(req.params.id, isActive)
    res.status(200).json(supplier)
  }

  assignSupplierPlan = async (req: Request, res: Response): Promise<void> => {
    const { planId } = assignSupplierPlanSchema.parse(req.body)
    const supplier = await this.assignSupplierPlanUseCase.execute(req.params.id, planId)
    res.status(200).json(supplier)
  }

  getPartnerStock = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.getPartnerStockUseCase.execute()
    res.status(200).json(data)
  }
}

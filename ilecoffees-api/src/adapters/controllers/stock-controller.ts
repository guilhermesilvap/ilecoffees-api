import { Request, Response } from 'express'
import { AppError } from '@/utils/AppError'
import { adjustStockSchema } from '@/adapters/validators/stock-schema'
import { AdjustStockUseCase } from '@/use-cases/adjust-stock'
import { ListStockMovementsUseCase } from '@/use-cases/list-stock-movements'
import { GetCoffeeshopStockForSupplierUseCase } from '@/use-cases/get-coffeeshop-stock-for-supplier'
import { CoffeesRepository } from '@/repositories/coffees-repository'

export class StockController {
  constructor(
    private adjustStockUseCase: AdjustStockUseCase,
    private listStockMovementsUseCase: ListStockMovementsUseCase,
    private coffeesRepository: CoffeesRepository,
    private getCoffeeshopStockForSupplierUseCase: GetCoffeeshopStockForSupplierUseCase,
  ) {}

  overview = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'SUPPLIER') throw new AppError('Acesso restrito a fornecedores', 403)

    const coffees = await this.coffeesRepository.list({ supplierId: req.user.id })
    res.status(200).json(coffees)
  }

  adjust = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'SUPPLIER') throw new AppError('Acesso restrito a fornecedores', 403)

    const { id } = req.params
    const data = adjustStockSchema.parse(req.body)

    const result = await this.adjustStockUseCase.execute({
      coffeeId: id,
      supplierId: req.user.id,
      delta: data.delta,
      type: data.type,
      reason: data.reason,
    })

    res.status(200).json(result)
  }

  movements = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'SUPPLIER') throw new AppError('Acesso restrito a fornecedores', 403)

    const coffeeId = req.query.coffeeId as string | undefined

    const movements = await this.listStockMovementsUseCase.execute({
      supplierId: req.user.id,
      coffeeId,
    })

    res.status(200).json(movements)
  }

  coffeeshopOverview = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'SUPPLIER') throw new AppError('Acesso restrito a fornecedores', 403)
    const data = await this.getCoffeeshopStockForSupplierUseCase.execute(req.user.id)
    res.status(200).json(data)
  }
}

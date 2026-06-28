import { Request, Response } from 'express'
import { AppError } from '@/utils/AppError'
import { ListCoffeeshopStockUseCase } from '@/use-cases/list-coffeeshop-stock'
import { UpsertCoffeeshopStockUseCase } from '@/use-cases/upsert-coffeeshop-stock'
import { NotifyLowStockUseCase } from '@/use-cases/notify-low-stock'

export class CoffeeshopStockController {
  constructor(
    private listUseCase: ListCoffeeshopStockUseCase,
    private upsertUseCase: UpsertCoffeeshopStockUseCase,
    private notifyUseCase: NotifyLowStockUseCase,
  ) {}

  private requireCoffeeshop(req: Request): string {
    const isEmployee = req.user?.type === 'EMPLOYEE'
    const isCoffeeshop = req.user?.type === 'USER' && req.user?.accountType === 'COFFEESHOP'
    if (!isEmployee && !isCoffeeshop) {
      throw new AppError('Apenas usuários do tipo Cafeteria podem acessar este recurso', 403)
    }
    return req.user!.id
  }

  list = async (req: Request, res: Response) => {
    const userId = this.requireCoffeeshop(req)
    const stock = await this.listUseCase.execute(userId)
    res.json(stock)
  }

  upsert = async (req: Request, res: Response) => {
    const userId = this.requireCoffeeshop(req)
    const { coffeeId } = req.params
    const { quantity, alertAt } = req.body

    if (typeof quantity !== 'number') {
      res.status(400).json({ message: 'quantity é obrigatório e deve ser número' })
      return
    }

    const stock = await this.upsertUseCase.execute({ userId, coffeeId, quantity, alertAt })
    res.json(stock)
  }

  notify = async (req: Request, res: Response) => {
    const userId = this.requireCoffeeshop(req)
    const { coffeeId } = req.params
    await this.notifyUseCase.execute(userId, coffeeId)
    res.json({ ok: true })
  }
}

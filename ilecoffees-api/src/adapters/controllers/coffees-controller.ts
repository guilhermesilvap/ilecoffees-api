import { Request, Response } from 'express'
import { AppError } from '@/utils/AppError'
import { coffeeCreateSchema, coffeeUpdateSchema, coffeeQuerySchema } from '@/adapters/validators/coffee-schema'
import { CreateCoffeeUseCase } from '@/use-cases/create-coffee'
import { UpdateCoffeeUseCase } from '@/use-cases/update-coffee'
import { DeleteCoffeeUseCase } from '@/use-cases/delete-coffee'
import { ListCoffeesUseCase } from '@/use-cases/list-coffees'
import { GetCoffeeUseCase } from '@/use-cases/get-coffee'

export class CoffeesController {
  constructor(
    private createCoffeeUseCase: CreateCoffeeUseCase,
    private updateCoffeeUseCase: UpdateCoffeeUseCase,
    private deleteCoffeeUseCase: DeleteCoffeeUseCase,
    private listCoffeesUseCase: ListCoffeesUseCase,
    private getCoffeeUseCase: GetCoffeeUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'SUPPLIER') {
      throw new AppError('Você não tem permissão para acrescentar cafés', 403)
    }

    const data = coffeeCreateSchema.parse(req.body)
    const photoUrl = req.file?.path ?? null

    const coffee = await this.createCoffeeUseCase.execute({
      ...data,
      photoUrl,
      supplierId: req.user.id,
    })

    res.status(201).json(coffee)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type === 'USER' || req.user?.type === 'ADMIN') {
      throw new AppError('Você não tem permissão para atualizar cafés', 403)
    }

    const { id } = req.params
    const data = coffeeUpdateSchema.parse(req.body)
    const photoUrl = req.file?.path ?? undefined
    const requestingSupplierId = req.user?.type === 'SUPPLIER' ? req.user.id : undefined

    const coffee = await this.updateCoffeeUseCase.execute(id, { ...data, photoUrl }, requestingSupplierId)

    res.status(200).json(coffee)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type === 'USER' || req.user?.type === 'ADMIN') {
      throw new AppError('Você não tem permissão para deletar cafés', 403)
    }

    const { id } = req.params
    const requestingSupplierId = req.user?.type === 'SUPPLIER' ? req.user.id : undefined
    await this.deleteCoffeeUseCase.execute(id, requestingSupplierId)

    res.status(204).send()
  }

  show = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const coffee = await this.getCoffeeUseCase.execute(id)
    res.status(200).json(coffee)
  }

  index = async (req: Request, res: Response): Promise<void> => {
    const filters = coffeeQuerySchema.parse(req.query)
    const coffees = await this.listCoffeesUseCase.execute(filters, req.user)
    res.status(200).json(coffees)
  }
}

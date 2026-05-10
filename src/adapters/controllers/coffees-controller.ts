import { Request, Response } from 'express'
import { AppError } from '@/utils/AppError'
import { coffeeCreateSchema, coffeeUpdateSchema, coffeeQuerySchema } from '@/adapters/validators/coffee-schema'
import { CreateCoffeeUseCase } from '@/use-cases/create-coffee'
import { UpdateCoffeeUseCase } from '@/use-cases/update-coffee'
import { DeleteCoffeeUseCase } from '@/use-cases/delete-coffee'
import { ListCoffeesUseCase } from '@/use-cases/list-coffees'

export class CoffeesController {
  constructor(
    private createCoffeeUseCase: CreateCoffeeUseCase,
    private updateCoffeeUseCase: UpdateCoffeeUseCase,
    private deleteCoffeeUseCase: DeleteCoffeeUseCase,
    private listCoffeesUseCase: ListCoffeesUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type === 'USER') {
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
    if (req.user?.type === 'USER') {
      throw new AppError('Você não tem permissão para atualizar cafés', 403)
    }

    const { id } = req.params
    const data = coffeeUpdateSchema.parse(req.body)
    const photoUrl = req.file?.path ?? undefined

    const coffee = await this.updateCoffeeUseCase.execute(id, { ...data, photoUrl })

    res.status(200).json(coffee)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type === 'USER') {
      throw new AppError('Você não tem permissão para deletar cafés', 403)
    }

    const { id } = req.params
    await this.deleteCoffeeUseCase.execute(id)

    res.status(204).send()
  }

  index = async (req: Request, res: Response): Promise<void> => {
    const filters = coffeeQuerySchema.parse(req.query)

    if (req.user?.type === 'SUPPLIER') {
      filters.supplierId = req.user.id
    }

    const coffees = await this.listCoffeesUseCase.execute(filters)

    res.status(200).json(coffees)
  }
}

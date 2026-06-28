import { Request, Response } from 'express'
import { userCreateSchema, userUpdateSchema } from '@/adapters/validators/user-schema'
import { CreateUserUseCase } from '@/use-cases/create-user'
import { UpdateUserUseCase } from '@/use-cases/update-user'

export class UsersController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private updateUserUseCase: UpdateUserUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const data = userCreateSchema.parse(req.body)
    const photoUrl = req.file?.path ?? null

    const user = await this.createUserUseCase.execute({ ...data, photoUrl })

    res.status(201).json(user)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const data = userUpdateSchema.parse(req.body)
    const photoUrl = req.file?.path ?? undefined

    const user = await this.updateUserUseCase.execute(req.user.id, { ...data, photoUrl })

    res.status(200).json(user)
  }
}

import { Request, Response } from 'express'
import { AppError } from '@/utils/AppError'
import { sessionCreateSchema } from '@/adapters/validators/session-schema'
import { CreateSessionUseCase } from '@/use-cases/create-session'
import { RefreshSessionUseCase } from '@/use-cases/refresh-session'

export class SessionsController {
  constructor(
    private createSessionUseCase: CreateSessionUseCase,
    private refreshSessionUseCase: RefreshSessionUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = sessionCreateSchema.parse(req.body)
    const result = await this.createSessionUseCase.execute({ email, password })
    res.json(result)
  }

  refresh = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new AppError('refreshToken é obrigatório', 400)
    }
    const result = await this.refreshSessionUseCase.execute(refreshToken)
    res.json(result)
  }
}

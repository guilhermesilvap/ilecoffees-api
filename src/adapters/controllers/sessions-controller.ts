import { Request, Response } from 'express'
import { sessionCreateSchema } from '@/adapters/validators/session-schema'
import { CreateSessionUseCase } from '@/use-cases/create-session'

export class SessionsController {
  constructor(private createSessionUseCase: CreateSessionUseCase) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = sessionCreateSchema.parse(req.body)

    const result = await this.createSessionUseCase.execute({ email, password })

    res.json(result)
  }
}

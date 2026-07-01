import { Request, Response } from 'express'
import { z } from 'zod'
import { ForgotPasswordUseCase } from '@/use-cases/forgot-password'
import { ResetPasswordUseCase } from '@/use-cases/reset-password'

export class PasswordResetController {
  constructor(
    private forgotPasswordUseCase: ForgotPasswordUseCase,
    private resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  forgot = async (req: Request, res: Response): Promise<void> => {
    const { email } = z.object({ email: z.string().email() }).parse(req.body)
    await this.forgotPasswordUseCase.execute({ email })
    res.status(200).json({ message: 'Se este e-mail estiver cadastrado, você receberá um link em instantes.' })
  }

  reset = async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = z.object({
      token: z.string().min(1),
      newPassword: z.string().min(6),
    }).parse(req.body)
    await this.resetPasswordUseCase.execute({ token, newPassword })
    res.status(200).json({ message: 'Senha redefinida com sucesso.' })
  }
}

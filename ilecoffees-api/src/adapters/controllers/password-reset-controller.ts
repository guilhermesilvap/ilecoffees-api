import { Request, Response } from 'express'
import { z } from 'zod'
import { ForgotPasswordUseCase } from '@/use-cases/forgot-password'
import { ResetPasswordUseCase } from '@/use-cases/reset-password'
import { VerifyEmailUseCase } from '@/use-cases/verify-email'

export class PasswordResetController {
  constructor(
    private forgotPasswordUseCase: ForgotPasswordUseCase,
    private resetPasswordUseCase: ResetPasswordUseCase,
    private verifyEmailUseCase: VerifyEmailUseCase,
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

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const { token } = z.object({ token: z.string().min(1) }).parse(req.query)
    await this.verifyEmailUseCase.execute(token)
    res.status(200).json({ message: 'E-mail confirmado com sucesso!' })
  }
}

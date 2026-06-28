import { verify, sign } from 'jsonwebtoken'
import { AppError } from '@/utils/AppError'
import { authConfig } from '@/configs/auth'

interface RefreshPayload {
  id: string
  type: 'USER' | 'SUPPLIER' | 'ADMIN'
}

interface RefreshSessionOutput {
  token: string
}

export class RefreshSessionUseCase {
  async execute(refreshToken: string): Promise<RefreshSessionOutput> {
    const { refreshSecret, secret, expiresIn } = authConfig.jwt

    let payload: RefreshPayload
    try {
      payload = verify(refreshToken, refreshSecret) as RefreshPayload
    } catch {
      throw new AppError('Refresh token inválido ou expirado. Faça login novamente.', 401)
    }

    const token = sign({ id: payload.id, type: payload.type }, secret, { expiresIn } as Parameters<typeof sign>[2])
    return { token }
  }
}

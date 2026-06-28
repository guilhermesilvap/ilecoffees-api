import { authConfig } from '@/configs/auth'
import { AppError } from '@/utils/AppError'
import { NextFunction, Request, Response } from 'express'
import { verify } from 'jsonwebtoken'

interface TokenPayload {
  id: string
  type: 'USER' | 'SUPPLIER' | 'ADMIN'
  accountType?: 'CUSTOMER' | 'COFFEESHOP'
  supplierType?: 'PRODUCER' | 'ROASTER'
}

// Aceita token via header Authorization OU query param ?token=
// Usado exclusivamente na rota SSE onde EventSource não suporta headers customizados
export function requireAuthOrQuery(request: Request, response: Response, next: NextFunction) {
  const headerToken = request.headers.authorization?.split(' ')[1]
  const queryToken = request.query.token as string | undefined
  const token = headerToken ?? queryToken

  if (!token) throw new AppError('Token não informado', 401)

  try {
    const { id, type, accountType, supplierType } = verify(token, authConfig.jwt.secret) as TokenPayload
    request.user = { id, type, accountType, supplierType }
    return next()
  } catch {
    throw new AppError('Token inválido', 401)
  }
}

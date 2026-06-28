import { authConfig } from '@/configs/auth'
import { NextFunction, Request, Response } from 'express'
import { verify } from 'jsonwebtoken'

interface TokenPayload {
  id: string
  type: 'USER' | 'SUPPLIER' | 'ADMIN'
  accountType?: 'CUSTOMER' | 'COFFEESHOP'
  supplierType?: 'PRODUCER' | 'ROASTER'
}

export function optionalAuth(request: Request, response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization
  if (!authHeader) return next()
  const [, token] = authHeader.split(' ')
  try {
    const { id, type, accountType, supplierType } = verify(token, authConfig.jwt.secret) as TokenPayload
    request.user = { id, type, accountType, supplierType }
  } catch {
    // invalid or expired token — proceed without user context
  }
  return next()
}

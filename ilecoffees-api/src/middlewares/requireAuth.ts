import { authConfig } from "@/configs/auth"
import { AppError } from "@/utils/AppError"
import { NextFunction, Request, Response } from "express"
import { verify } from "jsonwebtoken"

interface TokenPayload {
  id: string
  type: 'USER' | 'SUPPLIER' | 'ADMIN' | 'EMPLOYEE'
  accountType?: 'CUSTOMER' | 'COFFEESHOP'
  supplierType?: 'PRODUCER' | 'ROASTER'
  coffeeshopId?: string
}

function requireAuth(request: Request, response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization

  if (!authHeader) {
    throw new AppError('Token não informado', 401)
  }

  const [, token] = authHeader.split(' ')

  try {
    const { id, type, accountType, supplierType, coffeeshopId } = verify(token, authConfig.jwt.secret) as TokenPayload
    request.user = { id, type, accountType, supplierType, coffeeshopId }
    return next()
  } catch {
    throw new AppError('Token inválido', 401)
  }
}

export { requireAuth }

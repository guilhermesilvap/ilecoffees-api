import { AppError } from '@/utils/AppError'
import { NextFunction, Request, Response } from 'express'

export function requireEmployee(request: Request, _response: Response, next: NextFunction) {
  if (request.user?.type !== 'EMPLOYEE') {
    throw new AppError('Acesso restrito a funcionários', 403)
  }
  return next()
}

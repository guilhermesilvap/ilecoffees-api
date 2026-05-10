import { AppError } from '@/utils/AppError'
import { NextFunction, Request, Response } from 'express'

function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.type !== 'ADMIN') {
    throw new AppError('Acesso restrito a administradores', 403)
  }
  next()
}

export { requireAdmin }

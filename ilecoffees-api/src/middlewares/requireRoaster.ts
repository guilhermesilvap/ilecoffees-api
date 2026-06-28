import { AppError } from '@/utils/AppError'
import { NextFunction, Request, Response } from 'express'
import { SuppliersRepository } from '@/repositories/suppliers-repository'

export function requireRoaster(suppliersRepository: SuppliersRepository) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.type !== 'SUPPLIER' || req.user?.supplierType !== 'ROASTER') {
      throw new AppError('Acesso restrito a torrefadores', 403)
    }

    const supplier = await suppliersRepository.findById(req.user.id)
    if (!supplier || !supplier.isActive) {
      throw new AppError('Sua conta foi desativada. Entre em contato com o suporte.', 403)
    }

    next()
  }
}

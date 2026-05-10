import { Request, Response } from 'express'
import { supplierCreateSchema, supplierUpdateSchema } from '@/adapters/validators/supplier-schema'
import { CreateSupplierUseCase } from '@/use-cases/create-supplier'
import { UpdateSupplierUseCase } from '@/use-cases/update-supplier'

export class SuppliersController {
  constructor(
    private createSupplierUseCase: CreateSupplierUseCase,
    private updateSupplierUseCase: UpdateSupplierUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const data = supplierCreateSchema.parse(req.body)
    const photoUrl = req.file?.path ?? null

    await this.createSupplierUseCase.execute({ ...data, photoUrl })

    res.status(201).json()
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const data = supplierUpdateSchema.parse(req.body)
    const photoUrl = req.file?.path ?? undefined

    const supplier = await this.updateSupplierUseCase.execute(req.user.id, { ...data, photoUrl })

    res.status(200).json(supplier)
  }
}

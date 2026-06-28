import { Request, Response } from 'express'
import { supplierCreateSchema, supplierUpdateSchema } from '@/adapters/validators/supplier-schema'
import { CreateSupplierUseCase } from '@/use-cases/create-supplier'
import { UpdateSupplierUseCase } from '@/use-cases/update-supplier'
import { ConnectMpAccountUseCase } from '@/use-cases/connect-mp-account'
import { DisconnectMpAccountUseCase } from '@/use-cases/disconnect-mp-account'
import { SuppliersRepository } from '@/repositories/suppliers-repository'
import { mpPaymentService } from '@/services/mercadopago-payment-service'

export class SuppliersController {
  constructor(
    private createSupplierUseCase: CreateSupplierUseCase,
    private updateSupplierUseCase: UpdateSupplierUseCase,
    private suppliersRepository: SuppliersRepository,
    private connectMpAccountUseCase: ConnectMpAccountUseCase,
    private disconnectMpAccountUseCase: DisconnectMpAccountUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const data = supplierCreateSchema.parse(req.body)
    const photoUrl = req.file?.path ?? null

    const supplier = await this.createSupplierUseCase.execute({ ...data, photoUrl })

    res.status(201).json(supplier)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const data = supplierUpdateSchema.parse(req.body)
    const photoUrl = req.file?.path ?? undefined

    const supplier = await this.updateSupplierUseCase.execute(req.user.id, { ...data, photoUrl })

    res.status(200).json(supplier)
  }

  listPublic = async (_req: Request, res: Response): Promise<void> => {
    const suppliers = await this.suppliersRepository.list({ isActive: true })
    res.json(suppliers.map(s => ({
      id: s.id,
      name: s.name,
      photoUrl: s.photoUrl,
      supplierType: s.supplierType,
      city: s.city,
      state: s.state,
    })))
  }

  mpAuthUrl = async (req: Request, res: Response): Promise<void> => {
    const state = req.user.id
    const url = mpPaymentService.getAuthUrl(state)
    res.json({ url })
  }

  mpConnect = async (req: Request, res: Response): Promise<void> => {
    const { code } = req.body as { code: string }
    const supplier = await this.connectMpAccountUseCase.execute(req.user.id, code)
    res.json({ connected: true, mpUserId: supplier.mpUserId })
  }

  mpDisconnect = async (req: Request, res: Response): Promise<void> => {
    await this.disconnectMpAccountUseCase.execute(req.user.id)
    res.json({ connected: false })
  }

  mpStatus = async (req: Request, res: Response): Promise<void> => {
    const supplier = await this.suppliersRepository.findById(req.user.id)
    res.json({ connected: supplier?.mpConnected ?? false, mpUserId: supplier?.mpUserId ?? null })
  }
}

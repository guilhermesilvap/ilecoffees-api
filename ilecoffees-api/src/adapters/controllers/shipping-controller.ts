import { Request, Response } from 'express'
import { z } from 'zod'
import { AppError } from '@/utils/AppError'
import { CalculateShippingUseCase } from '@/use-cases/calculate-shipping'
import { EstimateProductShippingUseCase } from '@/use-cases/estimate-product-shipping'

const estimateQuerySchema = z.object({
  cep: z.string().min(8).max(9),
})

const estimateProductQuerySchema = z.object({
  cep: z.string().min(8).max(9),
  coffeeId: z.string().uuid(),
})

export class ShippingController {
  constructor(
    private calculateShippingUseCase: CalculateShippingUseCase,
    private estimateProductShippingUseCase: EstimateProductShippingUseCase,
  ) {}

  estimate = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) throw new AppError('Não autenticado', 401)
    const { cep } = estimateQuerySchema.parse(req.query)
    const groups = await this.calculateShippingUseCase.execute(req.user.id, cep)
    res.status(200).json(groups)
  }

  estimateProduct = async (req: Request, res: Response): Promise<void> => {
    const { cep, coffeeId } = estimateProductQuerySchema.parse(req.query)
    const options = await this.estimateProductShippingUseCase.execute(coffeeId, cep)
    res.status(200).json(options)
  }
}

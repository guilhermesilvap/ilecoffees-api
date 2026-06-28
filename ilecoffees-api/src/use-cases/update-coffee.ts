import { AppError } from '@/utils/AppError'
import { Coffee } from '@/entities/coffee'
import { CoffeesRepository, UpdateCoffeeDTO } from '@/repositories/coffees-repository'
import { SuppliersRepository } from '@/repositories/suppliers-repository'

export class UpdateCoffeeUseCase {
  constructor(
    private coffeesRepository: CoffeesRepository,
    private suppliersRepository: SuppliersRepository,
  ) {}

  async execute(id: string, data: UpdateCoffeeDTO, requestingSupplierId?: string): Promise<Coffee> {
    const existing = await this.coffeesRepository.findById(id)
    if (!existing) throw new AppError('Café inexistente', 404)

    if (requestingSupplierId) {
      if (existing.supplierId !== requestingSupplierId) {
        throw new AppError('Você não tem permissão para editar este café', 403)
      }
      const supplier = await this.suppliersRepository.findById(requestingSupplierId)
      if (supplier && !supplier.isActive) {
        throw new AppError('Sua conta está desativada. Entre em contato com o suporte.', 403)
      }
    }

    const updateData: UpdateCoffeeDTO = { ...data }

    const newType = data.saleType
    const oldType = existing.saleType

    if (newType && newType !== oldType) {
      if (newType === 'KG') {
        updateData.packagePrice = null
        updateData.packageWeight = null
      } else {
        updateData.pricePerKg = null
        updateData.stock = null
      }
    }

    return this.coffeesRepository.update(id, updateData)
  }
}

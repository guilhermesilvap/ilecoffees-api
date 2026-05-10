import { AppError } from '@/utils/AppError'
import { Coffee } from '@/entities/coffee'
import { CoffeesRepository, UpdateCoffeeDTO } from '@/repositories/coffees-repository'

export class UpdateCoffeeUseCase {
  constructor(private coffeesRepository: CoffeesRepository) {}

  async execute(id: string, data: UpdateCoffeeDTO): Promise<Coffee> {
    const existing = await this.coffeesRepository.findById(id)
    if (!existing) throw new AppError('Café inexistente', 404)

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

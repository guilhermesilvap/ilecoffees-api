import { AppError } from '@/utils/AppError'
import { Coffee } from '@/entities/coffee'
import { CoffeesRepository, CreateCoffeeDTO } from '@/repositories/coffees-repository'
import { SuppliersRepository } from '@/repositories/suppliers-repository'

export class CreateCoffeeUseCase {
  constructor(
    private coffeesRepository: CoffeesRepository,
    private suppliersRepository: SuppliersRepository,
  ) {}

  async execute(data: CreateCoffeeDTO): Promise<Coffee> {
    const supplier = await this.suppliersRepository.findById(data.supplierId)
    if (!supplier) throw new AppError('Fornecedor não encontrado', 404)
    if (!supplier.isActive) throw new AppError('Sua conta está desativada. Entre em contato com o suporte.', 403)

    const coffeeData: CreateCoffeeDTO = { ...data }

    if (data.saleType === 'KG') {
      coffeeData.packagePrice = null
      coffeeData.packagePriceCoffeeshop = null
      coffeeData.packageWeight = null
    } else if (data.saleType === 'PACKAGE') {
      coffeeData.pricePerKg = null
      coffeeData.stock = null
    }
    // saleType BOTH keeps all price fields

    return this.coffeesRepository.create(coffeeData)
  }
}

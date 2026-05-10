import { Coffee } from '@/entities/coffee'
import { CoffeesRepository, CreateCoffeeDTO } from '@/repositories/coffees-repository'

export class CreateCoffeeUseCase {
  constructor(private coffeesRepository: CoffeesRepository) {}

  async execute(data: CreateCoffeeDTO): Promise<Coffee> {
    const coffeeData: CreateCoffeeDTO = { ...data }

    if (data.saleType === 'KG') {
      coffeeData.packagePrice = null
      coffeeData.packageWeight = null
    } else {
      coffeeData.pricePerKg = null
      coffeeData.stock = null
    }

    return this.coffeesRepository.create(coffeeData)
  }
}

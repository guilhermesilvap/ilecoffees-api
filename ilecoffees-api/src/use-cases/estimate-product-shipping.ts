import { AppError } from '@/utils/AppError'
import { ShippingOption, ShippingService } from '@/repositories/shipping-service'
import { CoffeesRepository } from '@/repositories/coffees-repository'
import { SuppliersRepository } from '@/repositories/suppliers-repository'

export class EstimateProductShippingUseCase {
  constructor(
    private coffeesRepository: CoffeesRepository,
    private suppliersRepository: SuppliersRepository,
    private shippingService: ShippingService,
  ) {}

  async execute(coffeeId: string, destinationCep: string): Promise<ShippingOption[]> {
    const coffee = await this.coffeesRepository.findById(coffeeId)
    if (!coffee) throw new AppError('Café não encontrado', 404)

    const supplier = await this.suppliersRepository.findById(coffee.supplierId)
    if (!supplier?.cep) throw new AppError('Fornecedor sem CEP cadastrado', 422)

    const options = await this.shippingService.calculate({
      originCep: supplier.cep,
      destinationCep,
      products: [
        {
          weightGrams: coffee.weightGrams ?? 500,
          heightCm: coffee.heightCm ?? 10,
          widthCm: coffee.widthCm ?? 15,
          lengthCm: coffee.lengthCm ?? 20,
          quantity: 1,
          insuranceValue: coffee.packagePrice ?? coffee.pricePerKg ?? 0,
        },
      ],
    })
    return options.slice(0, 5)
  }
}

import { CoffeeshopStockRepository } from '@/repositories/coffeeshop-stock-repository'
import { CoffeesRepository } from '@/repositories/coffees-repository'
import { UsersRepository } from '@/repositories/users-repository'
import { SuppliersRepository } from '@/repositories/suppliers-repository'
import { NotificationService } from '@/services/notification-service'

export class NotifyLowStockUseCase {
  constructor(
    private stockRepo: CoffeeshopStockRepository,
    private coffeesRepo: CoffeesRepository,
    private usersRepo: UsersRepository,
    private suppliersRepo: SuppliersRepository,
    private notificationService: NotificationService,
  ) {}

  async execute(userId: string, coffeeId: string) {
    const [stock, coffee, user] = await Promise.all([
      this.stockRepo.findByUserAndCoffee(userId, coffeeId),
      this.coffeesRepo.findById(coffeeId),
      this.usersRepo.findById(userId),
    ])

    if (!stock || !coffee || !user) throw new Error('Recurso não encontrado')

    const supplier = await this.suppliersRepo.findById(coffee.supplierId)
    if (!supplier) throw new Error('Torrefador não encontrado')

    await this.notificationService.notify(
      { id: supplier.id!, email: supplier.email, name: supplier.name },
      {
        type: 'LOW_STOCK',
        title: `Estoque baixo: ${coffee.name}`,
        body: `${user.name} está com estoque baixo de ${coffee.name} (${stock.quantity} restantes). Considere entrar em contato para reposição.`,
        data: { coffeeId, coffeeName: coffee.name, coffeeshopName: user.name, quantity: stock.quantity },
      },
      { supplierId: supplier.id! },
    )
  }
}

import { Coffee } from '@/entities/coffee'
import { CoffeesRepository, ListCoffeesFilters } from '@/repositories/coffees-repository'

export interface CatalogCaller {
  type?: string
  id?: string
  supplierType?: string
  accountType?: string
}

export class ListCoffeesUseCase {
  constructor(private coffeesRepository: CoffeesRepository) {}

  async execute(filters: ListCoffeesFilters, caller?: CatalogCaller): Promise<Coffee[]> {
    const scopedFilters = !filters.supplierId && caller ? this.applyCatalogScope(filters, caller) : filters
    return this.coffeesRepository.list(scopedFilters)
  }

  /**
   * Scoping rules for the public catalog (when no explicit supplierId is requested):
   *
   * ROASTER supplier  → sees PRODUCER coffees (to buy green beans)
   * PRODUCER supplier → sees only their own coffees
   * COFFEESHOP user   → sees all ROASTER coffees (kg + package)
   * Regular user      → sees ROASTER PACKAGE coffees only (consumer-facing)
   * Unauthenticated   → same as regular user
   * ADMIN / EMPLOYEE  → no extra filter (sees everything)
   */
  private applyCatalogScope(filters: ListCoffeesFilters, caller: CatalogCaller): ListCoffeesFilters {
    const scoped = { ...filters }

    if (caller.type === 'SUPPLIER') {
      if (caller.supplierType === 'ROASTER') {
        scoped.supplierType = 'PRODUCER'
      } else {
        scoped.supplierId = caller.id
      }
    } else if (caller.type === 'USER' || !caller.type) {
      scoped.supplierType = 'ROASTER'
      if (caller.accountType !== 'COFFEESHOP') {
        scoped.saleType = 'PACKAGE'
      }
    }

    return scoped
  }
}

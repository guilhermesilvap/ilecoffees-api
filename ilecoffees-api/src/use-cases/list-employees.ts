import { Employee } from '@/entities/employee'
import { EmployeesRepository } from '@/repositories/employees-repository'

export class ListEmployeesUseCase {
  constructor(private employeesRepository: EmployeesRepository) {}

  async execute(coffeeshopId: string): Promise<Employee[]> {
    return this.employeesRepository.listByCoffeeshop(coffeeshopId)
  }
}

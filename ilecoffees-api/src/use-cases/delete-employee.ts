import { AppError } from '@/utils/AppError'
import { EmployeesRepository } from '@/repositories/employees-repository'

export class DeleteEmployeeUseCase {
  constructor(private employeesRepository: EmployeesRepository) {}

  async execute(id: string, coffeeshopId: string): Promise<void> {
    const employee = await this.employeesRepository.findById(id)
    if (!employee || employee.coffeeshopId !== coffeeshopId) {
      throw new AppError('Funcionário não encontrado', 404)
    }
    await this.employeesRepository.softDelete(id, coffeeshopId)
  }
}

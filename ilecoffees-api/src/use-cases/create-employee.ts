import { hash } from 'bcrypt'
import { AppError } from '@/utils/AppError'
import { Employee } from '@/entities/employee'
import { EmployeesRepository } from '@/repositories/employees-repository'

export class CreateEmployeeUseCase {
  constructor(private employeesRepository: EmployeesRepository) {}

  async execute(input: { name: string; email: string; password: string; coffeeshopId: string }): Promise<Employee> {
    const existing = await this.employeesRepository.findByEmail(input.email.toLowerCase().trim())
    if (existing) throw new AppError('E-mail já cadastrado', 409)

    const passwordHash = await hash(input.password, 8)
    return this.employeesRepository.create({
      name: input.name,
      email: input.email.toLowerCase().trim(),
      passwordHash,
      coffeeshopId: input.coffeeshopId,
    })
  }
}

import { Request, Response } from 'express'
import { AppError } from '@/utils/AppError'
import { createEmployeeSchema } from '@/adapters/validators/employee-schema'
import { CreateEmployeeUseCase } from '@/use-cases/create-employee'
import { ListEmployeesUseCase } from '@/use-cases/list-employees'
import { DeleteEmployeeUseCase } from '@/use-cases/delete-employee'
import { EmployeesRepository } from '@/repositories/employees-repository'

export class EmployeesController {
  constructor(
    private createEmployeeUseCase: CreateEmployeeUseCase,
    private listEmployeesUseCase: ListEmployeesUseCase,
    private deleteEmployeeUseCase: DeleteEmployeeUseCase,
    private employeesRepository: EmployeesRepository,
  ) {}

  private safe(e: { passwordHash?: string; [k: string]: unknown }) {
    const { passwordHash: _, ...rest } = e
    return rest
  }

  private requireCoffeeshop(req: Request): string {
    if (req.user?.accountType !== 'COFFEESHOP') {
      throw new AppError('Apenas cafeterias podem acessar funcionários', 403)
    }
    return req.user.id
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const coffeeshopId = this.requireCoffeeshop(req)
    const data = createEmployeeSchema.parse(req.body)
    const employee = await this.createEmployeeUseCase.execute({ ...data, coffeeshopId })
    res.status(201).json(this.safe(employee as unknown as { passwordHash?: string; [k: string]: unknown }))
  }

  index = async (req: Request, res: Response): Promise<void> => {
    const coffeeshopId = this.requireCoffeeshop(req)
    const employees = await this.employeesRepository.listWithActivity(coffeeshopId)
    res.status(200).json(employees)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    const coffeeshopId = this.requireCoffeeshop(req)
    await this.deleteEmployeeUseCase.execute(req.params.id, coffeeshopId)
    res.status(204).send()
  }
}

import { PrismaClient, Employee as PrismaEmployee } from '@prisma/client'
import { Employee, EmployeeData } from '@/entities/employee'
import {
  CreateEmployeeDTO,
  EmployeesRepository,
  EmployeeWithActivity,
} from '@/repositories/employees-repository'

function toEmployeeDomain(r: PrismaEmployee): Employee {
  return new Employee({
    id: r.id,
    name: r.name,
    email: r.email,
    passwordHash: r.passwordHash,
    photoUrl: r.photoUrl,
    coffeeshopId: r.coffeeshopId,
    deletedAt: r.deletedAt,
    createdAt: r.createdAt,
  } satisfies EmployeeData)
}

export class PrismaEmployeesRepository implements EmployeesRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateEmployeeDTO): Promise<Employee> {
    const record = await this.prisma.employee.create({ data })
    return toEmployeeDomain(record)
  }

  async findByEmail(email: string): Promise<Employee | null> {
    const record = await this.prisma.employee.findFirst({ where: { email, deletedAt: null } })
    return record ? toEmployeeDomain(record) : null
  }

  async findById(id: string): Promise<Employee | null> {
    const record = await this.prisma.employee.findFirst({ where: { id, deletedAt: null } })
    return record ? toEmployeeDomain(record) : null
  }

  async listByCoffeeshop(coffeeshopId: string): Promise<Employee[]> {
    const records = await this.prisma.employee.findMany({
      where: { coffeeshopId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
    return records.map(toEmployeeDomain)
  }

  async listWithActivity(coffeeshopId: string): Promise<EmployeeWithActivity[]> {
    const records = await this.prisma.employee.findMany({
      where: { coffeeshopId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        stockLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
        courseViews: { orderBy: { viewedAt: 'desc' } },
      },
    })
    return records.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      photoUrl: r.photoUrl ?? null,
      coffeeshopId: r.coffeeshopId,
      lastAccessAt: r.lastAccessAt,
      createdAt: r.createdAt,
      stockLogs: r.stockLogs.map(l => ({
        id: l.id,
        coffeeId: l.coffeeId,
        coffeeName: l.coffeeName,
        previousQty: l.previousQty,
        newQty: l.newQty,
        createdAt: l.createdAt,
      })),
      courseViews: r.courseViews.map(v => ({
        courseId: v.courseId,
        courseName: v.courseName,
        viewedAt: v.viewedAt,
      })),
    }))
  }

  async softDelete(id: string, coffeeshopId: string): Promise<void> {
    await this.prisma.employee.updateMany({
      where: { id, coffeeshopId },
      data: { deletedAt: new Date() },
    })
  }

  async updateLastAccess(id: string): Promise<void> {
    await this.prisma.employee.update({ where: { id }, data: { lastAccessAt: new Date() } })
  }

  async logStockChange(data: {
    employeeId: string
    coffeeId: string
    coffeeName: string
    previousQty: number
    newQty: number
  }): Promise<void> {
    await this.prisma.employeeStockLog.create({ data })
  }

  async upsertCourseView(data: {
    employeeId: string
    courseId: string
    courseName: string
  }): Promise<void> {
    await this.prisma.employeeCourseView.upsert({
      where: { employeeId_courseId: { employeeId: data.employeeId, courseId: data.courseId } },
      create: { ...data, viewedAt: new Date() },
      update: { courseName: data.courseName, viewedAt: new Date() },
    })
  }
}

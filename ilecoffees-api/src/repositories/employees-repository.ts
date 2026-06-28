import { Employee } from '@/entities/employee'

export interface CreateEmployeeDTO {
  name: string
  email: string
  passwordHash: string
  coffeeshopId: string
}

export interface EmployeeStockLogEntry {
  id: string
  coffeeId: string
  coffeeName: string
  previousQty: number
  newQty: number
  createdAt: Date
}

export interface EmployeeCourseViewEntry {
  courseId: string
  courseName: string
  viewedAt: Date
}

export interface EmployeeWithActivity {
  id: string
  name: string
  email: string
  photoUrl: string | null
  coffeeshopId: string
  lastAccessAt: Date | null
  createdAt: Date
  stockLogs: EmployeeStockLogEntry[]
  courseViews: EmployeeCourseViewEntry[]
}

export interface EmployeesRepository {
  create(data: CreateEmployeeDTO): Promise<Employee>
  findByEmail(email: string): Promise<Employee | null>
  findById(id: string): Promise<Employee | null>
  listByCoffeeshop(coffeeshopId: string): Promise<Employee[]>
  listWithActivity(coffeeshopId: string): Promise<EmployeeWithActivity[]>
  softDelete(id: string, coffeeshopId: string): Promise<void>
  updateLastAccess(id: string): Promise<void>
  logStockChange(data: { employeeId: string; coffeeId: string; coffeeName: string; previousQty: number; newQty: number }): Promise<void>
  upsertCourseView(data: { employeeId: string; courseId: string; courseName: string }): Promise<void>
}

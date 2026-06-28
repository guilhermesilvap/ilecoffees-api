export interface EmployeeData {
  id: string
  name: string
  email: string
  passwordHash: string
  photoUrl?: string | null
  coffeeshopId: string
  deletedAt?: Date | null
  createdAt?: Date
}

export class Employee {
  id!: string
  name!: string
  email!: string
  passwordHash!: string
  photoUrl?: string | null
  coffeeshopId!: string
  deletedAt?: Date | null
  createdAt!: Date

  constructor(data: EmployeeData) {
    Object.assign(this, data)
  }

  toJSON() {
    const { passwordHash: _pw, ...safe } = this as Record<string, unknown>
    return safe
  }
}

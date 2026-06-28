export interface AdminData {
  id?: string
  name: string
  email: string
  passwordHash: string
  createdAt?: Date
}

export class Admin {
  id?: string
  name!: string
  email!: string
  passwordHash!: string
  createdAt?: Date

  constructor(data: AdminData) {
    Object.assign(this, data)
  }

  toJSON() {
    const { passwordHash: _pw, ...safe } = this as Record<string, unknown>
    return safe
  }
}

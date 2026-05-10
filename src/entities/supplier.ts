export interface SupplierData {
  id?: string
  photoUrl?: string | null
  name: string
  email: string
  passwordHash: string
  cep: string
  street: string
  number: string
  district: string
  city: string
  state: string
  complement?: string | null
  deletedAt?: Date | null
  createdAt?: Date
}

export class Supplier {
  id?: string
  photoUrl?: string | null
  name!: string
  email!: string
  passwordHash!: string
  cep!: string
  street!: string
  number!: string
  district!: string
  city!: string
  state!: string
  complement?: string | null
  deletedAt?: Date | null
  createdAt?: Date

  constructor(data: SupplierData) {
    Object.assign(this, data)
  }
}

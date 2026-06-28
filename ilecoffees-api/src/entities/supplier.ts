export type SupplierType = 'PRODUCER' | 'ROASTER'

export interface SupplierData {
  id?: string
  photoUrl?: string | null
  name: string
  email: string
  passwordHash: string
  supplierType?: SupplierType
  cep: string
  street: string
  number: string
  district: string
  city: string
  state: string
  complement?: string | null
  isActive?: boolean
  planId?: string | null
  mpAccessToken?: string | null
  mpRefreshToken?: string | null
  mpUserId?: string | null
  mpTokenExpiresAt?: Date | null
  deletedAt?: Date | null
  createdAt?: Date
}

export class Supplier {
  id?: string
  photoUrl?: string | null
  name!: string
  email!: string
  passwordHash!: string
  supplierType!: SupplierType
  cep!: string
  street!: string
  number!: string
  district!: string
  city!: string
  state!: string
  complement?: string | null
  isActive!: boolean
  planId?: string | null
  mpAccessToken?: string | null
  mpRefreshToken?: string | null
  mpUserId?: string | null
  mpTokenExpiresAt?: Date | null
  deletedAt?: Date | null
  createdAt?: Date

  constructor(data: SupplierData) {
    Object.assign(this, data)
  }

  get mpConnected(): boolean {
    return !!this.mpAccessToken
  }

  toJSON() {
    const { passwordHash: _pw, mpAccessToken: _at, mpRefreshToken: _rt, ...safe } = this as Record<string, unknown>
    return safe
  }
}

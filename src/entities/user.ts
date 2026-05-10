export type AccountType = 'INDIVIDUAL' | 'COMPANY'

export interface UserData {
  id?: string
  photoUrl?: string | null
  accountType: AccountType
  name: string
  email: string
  phoneNumber: string
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

export class User {
  id?: string
  photoUrl?: string | null
  accountType!: AccountType
  name!: string
  email!: string
  phoneNumber!: string
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

  constructor(data: UserData) {
    Object.assign(this, data)
  }
}

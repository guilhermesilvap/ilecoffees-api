import { User, AccountType } from '@/entities/user'

export interface CreateUserDTO {
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
}

export interface UpdateUserDTO {
  photoUrl?: string | null
  name?: string
  phoneNumber?: string
  cep?: string
  street?: string
  number?: string
  district?: string
  city?: string
  state?: string
  complement?: string | null
}

export interface UsersRepository {
  create(data: CreateUserDTO): Promise<User>
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  update(id: string, data: UpdateUserDTO): Promise<User>
  list(): Promise<User[]>
  softDelete(id: string): Promise<void>
}

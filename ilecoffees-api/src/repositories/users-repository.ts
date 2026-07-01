import { User, AccountType } from '@/entities/user'

export interface CreateUserDTO {
  photoUrl?: string | null
  accountType: AccountType
  name: string
  email: string
  phoneNumber: string
  passwordHash: string
  cpf?: string | null
  cnpj?: string | null
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

export interface ListUsersOptions {
  skip?: number
  take?: number
}

export interface UsersRepository {
  create(data: CreateUserDTO): Promise<User>
  findByEmail(email: string): Promise<User | null>
  existsByEmail(email: string): Promise<boolean>
  findById(id: string): Promise<User | null>
  update(id: string, data: UpdateUserDTO): Promise<User>
  list(opts?: ListUsersOptions): Promise<User[]>
  count(): Promise<number>
  softDelete(id: string): Promise<void>
  setResetToken(id: string, token: string, expiresAt: Date): Promise<void>
  findByResetToken(token: string): Promise<User | null>
  updatePassword(id: string, passwordHash: string): Promise<void>
}

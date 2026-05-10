import { Supplier } from '@/entities/supplier'

export interface CreateSupplierDTO {
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
}

export interface UpdateSupplierDTO {
  photoUrl?: string | null
  name?: string
  cep?: string
  street?: string
  number?: string
  district?: string
  city?: string
  state?: string
  complement?: string | null
}

export interface SuppliersRepository {
  create(data: CreateSupplierDTO): Promise<Supplier>
  findByEmail(email: string): Promise<Supplier | null>
  findById(id: string): Promise<Supplier | null>
  update(id: string, data: UpdateSupplierDTO): Promise<Supplier>
  list(): Promise<Supplier[]>
  softDelete(id: string): Promise<void>
}

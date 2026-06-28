import { Supplier, SupplierType } from '@/entities/supplier'

export interface CreateSupplierDTO {
  photoUrl?: string | null
  name: string
  email: string
  passwordHash: string
  supplierType?: SupplierType
  cnpj: string
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

export interface ListSuppliersFilters {
  isActive?: boolean
  skip?: number
  take?: number
}

export interface MpTokensDTO {
  mpAccessToken: string
  mpRefreshToken: string
  mpUserId: string
  mpTokenExpiresAt: Date
}

export interface SuppliersRepository {
  create(data: CreateSupplierDTO): Promise<Supplier>
  findByEmail(email: string): Promise<Supplier | null>
  existsByEmail(email: string): Promise<boolean>
  findById(id: string): Promise<Supplier | null>
  update(id: string, data: UpdateSupplierDTO): Promise<Supplier>
  list(filters?: ListSuppliersFilters): Promise<Supplier[]>
  count(filters?: Pick<ListSuppliersFilters, 'isActive'>): Promise<number>
  softDelete(id: string): Promise<void>
  toggleStatus(id: string, isActive: boolean): Promise<Supplier>
  assignPlan(id: string, planId: string | null): Promise<Supplier>
  clearPlanFromSuppliers(planId: string): Promise<void>
  updateMpTokens(id: string, tokens: MpTokensDTO): Promise<Supplier>
  clearMpTokens(id: string): Promise<Supplier>
}

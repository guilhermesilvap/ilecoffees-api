import { Admin } from '@/entities/admin'

export interface CreateAdminDTO {
  name: string
  email: string
  passwordHash: string
}

export interface AdminsRepository {
  create(data: CreateAdminDTO): Promise<Admin>
  findByEmail(email: string): Promise<Admin | null>
}

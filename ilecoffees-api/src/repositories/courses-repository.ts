import { Course, CourseLevel } from '@/entities/course'

export type CreateCourseDTO = {
  supplierId?: string | null
  title: string
  description: string
  imageUrl?: string | null
  price: number
  workloadHours: number
  level: CourseLevel
}

export type UpdateCourseDTO = Partial<Omit<CreateCourseDTO, 'supplierId'>>

export interface CoursesRepository {
  create(data: CreateCourseDTO): Promise<Course>
  findById(id: string): Promise<Course | null>
  list(supplierId?: string): Promise<Course[]>
  update(id: string, data: UpdateCourseDTO): Promise<Course>
  softDelete(id: string): Promise<void>
}

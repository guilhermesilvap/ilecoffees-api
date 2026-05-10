import { Course, CourseLevel } from '@/entities/course'

export type CreateCourseDTO = {
  title: string
  description: string
  imageUrl?: string | null
  price: number
  workloadHours: number
  level: CourseLevel
}

export type UpdateCourseDTO = Partial<CreateCourseDTO>

export interface CoursesRepository {
  create(data: CreateCourseDTO): Promise<Course>
  findById(id: string): Promise<Course | null>
  list(): Promise<Course[]>
  update(id: string, data: UpdateCourseDTO): Promise<Course>
  softDelete(id: string): Promise<void>
}

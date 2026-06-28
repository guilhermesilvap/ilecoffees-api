import { Course, CourseLevel } from '@/entities/course'
import { CoursesRepository } from '@/repositories/courses-repository'

interface CreateCourseInput {
  supplierId?: string | null
  title: string
  description: string
  imageUrl?: string | null
  price: number
  workloadHours: number
  level: CourseLevel
}

export class CreateCourseUseCase {
  constructor(private coursesRepository: CoursesRepository) {}

  async execute(data: CreateCourseInput): Promise<Course> {
    return this.coursesRepository.create(data)
  }
}

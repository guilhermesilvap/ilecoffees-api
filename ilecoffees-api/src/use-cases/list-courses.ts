import { Course } from '@/entities/course'
import { CoursesRepository } from '@/repositories/courses-repository'

export class ListCoursesUseCase {
  constructor(private coursesRepository: CoursesRepository) {}

  async execute(supplierId?: string): Promise<Course[]> {
    return this.coursesRepository.list(supplierId)
  }
}

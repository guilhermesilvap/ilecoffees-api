import { CourseEnrollmentsRepository } from '@/repositories/course-enrollments-repository'
import { CourseEnrollment } from '@/entities/course-enrollment'

export class ListEnrolledCoursesUseCase {
  constructor(private courseEnrollmentsRepository: CourseEnrollmentsRepository) {}

  async execute(userId: string): Promise<CourseEnrollment[]> {
    return this.courseEnrollmentsRepository.listByUser(userId)
  }
}

import { AppError } from '@/utils/AppError'
import { CourseEnrollmentWithUser, CourseEnrollmentsRepository } from '@/repositories/course-enrollments-repository'
import { CoursesRepository } from '@/repositories/courses-repository'

export class ListCourseEnrollmentsUseCase {
  constructor(
    private courseEnrollmentsRepository: CourseEnrollmentsRepository,
    private coursesRepository: CoursesRepository,
  ) {}

  async execute(courseId: string): Promise<CourseEnrollmentWithUser[]> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) throw new AppError('Curso não encontrado', 404)

    return this.courseEnrollmentsRepository.listByCourse(courseId)
  }
}

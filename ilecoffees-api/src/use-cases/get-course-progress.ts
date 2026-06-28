import { AppError } from '@/utils/AppError'
import { CourseLessonProgressRepository, CourseProgressSummary } from '@/repositories/course-lesson-progress-repository'
import { CourseEnrollmentsRepository } from '@/repositories/course-enrollments-repository'
import { CoursesRepository } from '@/repositories/courses-repository'

export class GetCourseProgressUseCase {
  constructor(
    private progressRepository: CourseLessonProgressRepository,
    private enrollmentsRepository: CourseEnrollmentsRepository,
    private coursesRepository: CoursesRepository,
  ) {}

  async execute(userId: string, courseId: string): Promise<CourseProgressSummary> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) throw new AppError('Curso não encontrado', 404)

    const enrollment = await this.enrollmentsRepository.findByUserAndCourse(userId, courseId)
    if (!enrollment) throw new AppError('Você não está matriculado neste curso', 403)

    return this.progressRepository.getCourseProgress(userId, courseId)
  }
}

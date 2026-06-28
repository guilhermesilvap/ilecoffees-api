import { AppError } from '@/utils/AppError'
import { CourseLessonProgress } from '@/entities/course-lesson-progress'
import { CourseLessonProgressRepository } from '@/repositories/course-lesson-progress-repository'
import { CourseEnrollmentsRepository } from '@/repositories/course-enrollments-repository'
import { CoursesRepository } from '@/repositories/courses-repository'
import { CourseLessonsRepository } from '@/repositories/course-lessons-repository'

export class MarkLessonCompleteUseCase {
  constructor(
    private progressRepository: CourseLessonProgressRepository,
    private enrollmentsRepository: CourseEnrollmentsRepository,
    private coursesRepository: CoursesRepository,
    private courseLessonsRepository: CourseLessonsRepository,
  ) {}

  async execute(userId: string, courseId: string, lessonId: string): Promise<CourseLessonProgress> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) throw new AppError('Curso não encontrado', 404)

    const enrollment = await this.enrollmentsRepository.findByUserAndCourse(userId, courseId)
    if (!enrollment) throw new AppError('Você não está matriculado neste curso', 403)

    const lesson = await this.courseLessonsRepository.findById(lessonId)
    if (!lesson || lesson.courseId !== courseId) {
      throw new AppError('Aula não encontrada neste curso', 404)
    }

    return this.progressRepository.markComplete(userId, lessonId)
  }
}

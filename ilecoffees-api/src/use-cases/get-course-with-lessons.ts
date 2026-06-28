import { AppError } from '@/utils/AppError'
import { Course } from '@/entities/course'
import { CoursesRepository } from '@/repositories/courses-repository'
import { CourseLessonsRepository } from '@/repositories/course-lessons-repository'
import { CourseEnrollmentsRepository } from '@/repositories/course-enrollments-repository'

type LessonView = {
  id?: string
  courseId: string
  title: string
  description?: string | null
  videoUrl: string | null
  order: number
  isLocked: boolean
  durationMinutes?: number | null
  createdAt?: Date
}

interface GetCourseWithLessonsResult {
  course: Course
  lessons: LessonView[]
  enrolled: boolean
}

export class GetCourseWithLessonsUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private courseLessonsRepository: CourseLessonsRepository,
    private courseEnrollmentsRepository: CourseEnrollmentsRepository,
  ) {}

  async execute(courseId: string, userId?: string): Promise<GetCourseWithLessonsResult> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) throw new AppError('Curso não encontrado', 404)

    const enrollment = userId
      ? await this.courseEnrollmentsRepository.findByUserAndCourse(userId, courseId)
      : null
    const enrolled = !!enrollment

    const lessons = await this.courseLessonsRepository.listByCourse(courseId)

    const lessonsWithAccess: LessonView[] = lessons.map((lesson) => ({
      id: lesson.id,
      courseId: lesson.courseId,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.isLocked && !enrolled ? null : lesson.videoUrl,
      order: lesson.order,
      isLocked: lesson.isLocked,
      durationMinutes: lesson.durationMinutes,
      createdAt: lesson.createdAt,
    }))

    return { course, lessons: lessonsWithAccess, enrolled }
  }
}

import { AppError } from '@/utils/AppError'
import { CourseLesson } from '@/entities/course-lesson'
import { CourseLessonsRepository } from '@/repositories/course-lessons-repository'
import { CoursesRepository } from '@/repositories/courses-repository'

interface CreateCourseLessonInput {
  courseId: string
  title: string
  description?: string | null
  videoUrl: string
  order: number
  isLocked: boolean
  durationMinutes?: number | null
}

export class CreateCourseLessonUseCase {
  constructor(
    private courseLessonsRepository: CourseLessonsRepository,
    private coursesRepository: CoursesRepository,
  ) {}

  async execute(data: CreateCourseLessonInput): Promise<CourseLesson> {
    const course = await this.coursesRepository.findById(data.courseId)
    if (!course) throw new AppError('Curso não encontrado', 404)

    return this.courseLessonsRepository.create(data)
  }
}

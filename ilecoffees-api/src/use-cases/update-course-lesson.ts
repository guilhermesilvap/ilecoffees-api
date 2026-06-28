import { AppError } from '@/utils/AppError'
import { CourseLesson } from '@/entities/course-lesson'
import { CourseLessonsRepository } from '@/repositories/course-lessons-repository'

interface UpdateCourseLessonInput {
  id: string
  courseId?: string
  title?: string
  description?: string | null
  videoUrl?: string
  order?: number
  isLocked?: boolean
  durationMinutes?: number | null
}

export class UpdateCourseLessonUseCase {
  constructor(private courseLessonsRepository: CourseLessonsRepository) {}

  async execute({ id, courseId, ...data }: UpdateCourseLessonInput): Promise<CourseLesson> {
    const existing = await this.courseLessonsRepository.findById(id)
    if (!existing) throw new AppError('Aula não encontrada', 404)

    if (courseId && existing.courseId !== courseId) {
      throw new AppError('Aula não pertence a este curso', 404)
    }

    return this.courseLessonsRepository.update(id, data)
  }
}

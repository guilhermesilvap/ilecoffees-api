import { AppError } from '@/utils/AppError'
import { CourseLessonsRepository } from '@/repositories/course-lessons-repository'

export class DeleteCourseLessonUseCase {
  constructor(private courseLessonsRepository: CourseLessonsRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.courseLessonsRepository.findById(id)
    if (!existing) throw new AppError('Aula não encontrada', 404)

    await this.courseLessonsRepository.delete(id)
  }
}

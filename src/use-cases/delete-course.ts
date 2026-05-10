import { AppError } from '@/utils/AppError'
import { CoursesRepository } from '@/repositories/courses-repository'

export class DeleteCourseUseCase {
  constructor(private coursesRepository: CoursesRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.coursesRepository.findById(id)
    if (!existing) throw new AppError('Curso não encontrado', 404)

    await this.coursesRepository.softDelete(id)
  }
}

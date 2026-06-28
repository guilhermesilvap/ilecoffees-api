import { AppError } from '@/utils/AppError'
import { Course, CourseLevel } from '@/entities/course'
import { CoursesRepository } from '@/repositories/courses-repository'

interface UpdateCourseInput {
  id: string
  requesterId?: string
  requesterType?: string
  title?: string
  description?: string
  imageUrl?: string | null
  price?: number
  workloadHours?: number
  level?: CourseLevel
}

export class UpdateCourseUseCase {
  constructor(private coursesRepository: CoursesRepository) {}

  async execute({ id, requesterId, requesterType, ...data }: UpdateCourseInput): Promise<Course> {
    const existing = await this.coursesRepository.findById(id)
    if (!existing) throw new AppError('Curso não encontrado', 404)

    if (requesterType === 'SUPPLIER' && existing.supplierId !== requesterId) {
      throw new AppError('Você não tem permissão para editar este curso', 403)
    }

    return this.coursesRepository.update(id, data)
  }
}

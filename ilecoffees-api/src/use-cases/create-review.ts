import { AppError } from '@/utils/AppError'
import { Review, ReviewType } from '@/entities/review'
import { ReviewsRepository } from '@/repositories/reviews-repository'
import { CoffeesRepository } from '@/repositories/coffees-repository'
import { CoursesRepository } from '@/repositories/courses-repository'
import { CourseEnrollmentsRepository } from '@/repositories/course-enrollments-repository'

export interface CreateReviewInput {
  userId: string
  targetId: string
  targetType: ReviewType
  rating: number
  comment?: string | null
}

export class CreateReviewUseCase {
  constructor(
    private reviewsRepository: ReviewsRepository,
    private coffeesRepository: CoffeesRepository,
    private coursesRepository: CoursesRepository,
    private enrollmentsRepository: CourseEnrollmentsRepository,
  ) {}

  async execute(data: CreateReviewInput): Promise<Review> {
    if (data.rating < 1 || data.rating > 5) {
      throw new AppError('A nota deve ser entre 1 e 5', 400)
    }

    if (data.targetType === 'COFFEE') {
      const coffee = await this.coffeesRepository.findById(data.targetId)
      if (!coffee) throw new AppError('Café não encontrado', 404)
    } else {
      const course = await this.coursesRepository.findById(data.targetId)
      if (!course) throw new AppError('Curso não encontrado', 404)

      const enrollment = await this.enrollmentsRepository.findByUserAndCourse(
        data.userId,
        data.targetId,
      )
      if (!enrollment) throw new AppError('Você precisa estar matriculado para avaliar este curso', 403)
    }

    return this.reviewsRepository.upsert(data)
  }
}

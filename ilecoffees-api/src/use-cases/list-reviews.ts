import { ReviewType } from '@/entities/review'
import { ReviewsRepository, ReviewWithUser } from '@/repositories/reviews-repository'

export class ListReviewsUseCase {
  constructor(private reviewsRepository: ReviewsRepository) {}

  async execute(targetId: string, targetType: ReviewType): Promise<ReviewWithUser[]> {
    return this.reviewsRepository.listByTarget(targetId, targetType)
  }
}

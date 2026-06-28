import { Review, ReviewType } from '@/entities/review'

export type CreateReviewDTO = {
  userId: string
  targetId: string
  targetType: ReviewType
  rating: number
  comment?: string | null
}

export type ReviewWithUser = Review & {
  user: { id: string; name: string }
}

export interface ReviewsRepository {
  upsert(data: CreateReviewDTO): Promise<Review>
  listByTarget(targetId: string, targetType: ReviewType): Promise<ReviewWithUser[]>
  findByUserAndTarget(userId: string, targetId: string, targetType: ReviewType): Promise<Review | null>
}

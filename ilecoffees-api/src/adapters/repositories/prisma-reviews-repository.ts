import { PrismaClient } from '@prisma/client'
import { Review, ReviewData, ReviewType } from '@/entities/review'
import { ReviewsRepository, CreateReviewDTO, ReviewWithUser } from '@/repositories/reviews-repository'

export class PrismaReviewsRepository implements ReviewsRepository {
  constructor(private prisma: PrismaClient) {}

  async upsert(data: CreateReviewDTO): Promise<Review> {
    const record = await this.prisma.review.upsert({
      where: {
        userId_targetId_targetType: {
          userId: data.userId,
          targetId: data.targetId,
          targetType: data.targetType,
        },
      },
      update: { rating: data.rating, comment: data.comment },
      create: data,
    })
    return new Review(record as unknown as ReviewData)
  }

  async listByTarget(targetId: string, targetType: ReviewType): Promise<ReviewWithUser[]> {
    const records = await this.prisma.review.findMany({
      where: { targetId, targetType },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    })
    return records as unknown as ReviewWithUser[]
  }

  async findByUserAndTarget(
    userId: string,
    targetId: string,
    targetType: ReviewType,
  ): Promise<Review | null> {
    const record = await this.prisma.review.findUnique({
      where: { userId_targetId_targetType: { userId, targetId, targetType } },
    })
    if (!record) return null
    return new Review(record as unknown as ReviewData)
  }
}

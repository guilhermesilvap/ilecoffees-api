import { Request, Response } from 'express'
import { AppError } from '@/utils/AppError'
import { createReviewSchema } from '@/adapters/validators/review-schema'
import { CreateReviewUseCase } from '@/use-cases/create-review'
import { ListReviewsUseCase } from '@/use-cases/list-reviews'
import { ReviewType } from '@/entities/review'

export class ReviewsController {
  constructor(
    private createReviewUseCase: CreateReviewUseCase,
    private listReviewsUseCase: ListReviewsUseCase,
  ) {}

  createForCoffee = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') {
      throw new AppError('Apenas usuários podem avaliar cafés', 403)
    }
    const { rating, comment } = createReviewSchema.parse(req.body)
    const review = await this.createReviewUseCase.execute({
      userId: req.user.id,
      targetId: req.params.id,
      targetType: 'COFFEE' as ReviewType,
      rating,
      comment,
    })
    res.status(201).json(review)
  }

  createForCourse = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') {
      throw new AppError('Apenas usuários podem avaliar cursos', 403)
    }
    const { rating, comment } = createReviewSchema.parse(req.body)
    const review = await this.createReviewUseCase.execute({
      userId: req.user.id,
      targetId: req.params.id,
      targetType: 'COURSE' as ReviewType,
      rating,
      comment,
    })
    res.status(201).json(review)
  }

  listForCoffee = async (req: Request, res: Response): Promise<void> => {
    const reviews = await this.listReviewsUseCase.execute(req.params.id, 'COFFEE')
    res.status(200).json(reviews)
  }

  listForCourse = async (req: Request, res: Response): Promise<void> => {
    const reviews = await this.listReviewsUseCase.execute(req.params.id, 'COURSE')
    res.status(200).json(reviews)
  }
}

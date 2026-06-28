export type ReviewType = 'COFFEE' | 'COURSE'

export type ReviewData = {
  id?: string
  userId: string
  targetId: string
  targetType: ReviewType
  rating: number
  comment?: string | null
  createdAt?: Date
}

export class Review {
  id?: string
  userId!: string
  targetId!: string
  targetType!: ReviewType
  rating!: number
  comment?: string | null
  createdAt?: Date

  constructor(data: ReviewData) {
    Object.assign(this, data)
  }
}

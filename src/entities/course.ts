export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export type CourseData = {
  id?: string
  title: string
  description: string
  imageUrl?: string | null
  price: number
  workloadHours: number
  level: CourseLevel
  deletedAt?: Date | null
  createdAt?: Date
}

export class Course {
  id?: string
  title!: string
  description!: string
  imageUrl?: string | null
  price!: number
  workloadHours!: number
  level!: CourseLevel
  deletedAt?: Date | null
  createdAt?: Date

  constructor(data: CourseData) {
    Object.assign(this, data)
  }
}

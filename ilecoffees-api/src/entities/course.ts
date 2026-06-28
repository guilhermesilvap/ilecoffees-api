export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export type CourseData = {
  id?: string
  supplierId?: string | null
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
  supplierId?: string | null
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

export type CourseLessonProgressData = {
  id?: string
  userId: string
  lessonId: string
  completedAt?: Date
}

export class CourseLessonProgress {
  id?: string
  userId!: string
  lessonId!: string
  completedAt?: Date

  constructor(data: CourseLessonProgressData) {
    Object.assign(this, data)
  }
}

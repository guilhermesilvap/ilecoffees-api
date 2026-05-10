export type CourseLessonData = {
  id?: string
  courseId: string
  title: string
  description?: string | null
  videoUrl: string
  order: number
  isLocked: boolean
  durationMinutes?: number | null
  createdAt?: Date
}

export class CourseLesson {
  id?: string
  courseId!: string
  title!: string
  description?: string | null
  videoUrl!: string
  order!: number
  isLocked!: boolean
  durationMinutes?: number | null
  createdAt?: Date

  constructor(data: CourseLessonData) {
    Object.assign(this, data)
  }
}

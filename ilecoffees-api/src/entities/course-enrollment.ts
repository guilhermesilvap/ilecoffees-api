export type CourseEnrollmentData = {
  id?: string
  userId: string
  courseId: string
  enrolledAt?: Date
}

export class CourseEnrollment {
  id?: string
  userId!: string
  courseId!: string
  enrolledAt?: Date

  constructor(data: CourseEnrollmentData) {
    Object.assign(this, data)
  }
}

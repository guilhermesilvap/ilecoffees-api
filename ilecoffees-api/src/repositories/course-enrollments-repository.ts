import { CourseEnrollment } from '@/entities/course-enrollment'

export type CreateCourseEnrollmentDTO = {
  userId: string
  courseId: string
}

export type CourseEnrollmentWithUser = {
  id: string
  userId: string
  courseId: string
  enrolledAt: Date
  user: { id: string; name: string; email: string }
}

export interface CourseEnrollmentsRepository {
  create(data: CreateCourseEnrollmentDTO): Promise<CourseEnrollment>
  findByUserAndCourse(userId: string, courseId: string): Promise<CourseEnrollment | null>
  listByUser(userId: string): Promise<CourseEnrollment[]>
  listByCourse(courseId: string): Promise<CourseEnrollmentWithUser[]>
}

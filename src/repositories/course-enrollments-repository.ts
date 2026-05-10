import { CourseEnrollment } from '@/entities/course-enrollment'

export type CreateCourseEnrollmentDTO = {
  userId: string
  courseId: string
}

export interface CourseEnrollmentsRepository {
  create(data: CreateCourseEnrollmentDTO): Promise<CourseEnrollment>
  findByUserAndCourse(userId: string, courseId: string): Promise<CourseEnrollment | null>
  listByUser(userId: string): Promise<CourseEnrollment[]>
}

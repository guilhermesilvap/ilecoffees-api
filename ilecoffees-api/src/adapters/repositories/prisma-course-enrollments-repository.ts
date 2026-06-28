import { PrismaClient } from '@prisma/client'
import { CourseEnrollment, CourseEnrollmentData } from '@/entities/course-enrollment'
import {
  CourseEnrollmentsRepository,
  CreateCourseEnrollmentDTO,
  CourseEnrollmentWithUser,
} from '@/repositories/course-enrollments-repository'

export class PrismaCourseEnrollmentsRepository implements CourseEnrollmentsRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateCourseEnrollmentDTO): Promise<CourseEnrollment> {
    const record = await this.prisma.courseEnrollment.create({ data })
    return new CourseEnrollment(record as unknown as CourseEnrollmentData)
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<CourseEnrollment | null> {
    const record = await this.prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })
    if (!record) return null
    return new CourseEnrollment(record as unknown as CourseEnrollmentData)
  }

  async listByUser(userId: string): Promise<CourseEnrollment[]> {
    const records = await this.prisma.courseEnrollment.findMany({
      where: { userId },
      orderBy: { enrolledAt: 'desc' },
    })
    return records.map((r) => new CourseEnrollment(r as unknown as CourseEnrollmentData))
  }

  async listByCourse(courseId: string): Promise<CourseEnrollmentWithUser[]> {
    const records = await this.prisma.courseEnrollment.findMany({
      where: { courseId },
      orderBy: { enrolledAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    return records as unknown as CourseEnrollmentWithUser[]
  }
}

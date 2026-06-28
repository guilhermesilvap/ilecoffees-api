import { PrismaClient } from '@prisma/client'
import { Course, CourseData } from '@/entities/course'
import { CoursesRepository, CreateCourseDTO, UpdateCourseDTO } from '@/repositories/courses-repository'

export class PrismaCoursesRepository implements CoursesRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateCourseDTO): Promise<Course> {
    const record = await this.prisma.course.create({ data })
    return new Course(record as unknown as CourseData)
  }

  async findById(id: string): Promise<Course | null> {
    const record = await this.prisma.course.findFirst({ where: { id, deletedAt: null } })
    if (!record) return null
    return new Course(record as unknown as CourseData)
  }

  async list(supplierId?: string): Promise<Course[]> {
    const where = supplierId
      ? { deletedAt: null, supplierId }
      : { deletedAt: null }
    const records = await this.prisma.course.findMany({ where, orderBy: { createdAt: 'desc' } })
    return records.map((r) => new Course(r as unknown as CourseData))
  }

  async update(id: string, data: UpdateCourseDTO): Promise<Course> {
    const record = await this.prisma.course.update({ where: { id }, data })
    return new Course(record as unknown as CourseData)
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.course.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}

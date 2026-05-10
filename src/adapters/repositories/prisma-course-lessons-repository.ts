import { PrismaClient } from '@prisma/client'
import { CourseLesson, CourseLessonData } from '@/entities/course-lesson'
import {
  CourseLessonsRepository,
  CreateCourseLessonDTO,
  UpdateCourseLessonDTO,
} from '@/repositories/course-lessons-repository'

export class PrismaCourseLessonsRepository implements CourseLessonsRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateCourseLessonDTO): Promise<CourseLesson> {
    const record = await this.prisma.courseLesson.create({ data })
    return new CourseLesson(record as unknown as CourseLessonData)
  }

  async findById(id: string): Promise<CourseLesson | null> {
    const record = await this.prisma.courseLesson.findUnique({ where: { id } })
    if (!record) return null
    return new CourseLesson(record as unknown as CourseLessonData)
  }

  async listByCourse(courseId: string): Promise<CourseLesson[]> {
    const records = await this.prisma.courseLesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    })
    return records.map((r) => new CourseLesson(r as unknown as CourseLessonData))
  }

  async update(id: string, data: UpdateCourseLessonDTO): Promise<CourseLesson> {
    const record = await this.prisma.courseLesson.update({ where: { id }, data })
    return new CourseLesson(record as unknown as CourseLessonData)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.courseLesson.delete({ where: { id } })
  }
}

import { PrismaClient } from '@prisma/client'
import { CourseLessonProgress, CourseLessonProgressData } from '@/entities/course-lesson-progress'
import {
  CourseLessonProgressRepository,
  CourseProgressSummary,
} from '@/repositories/course-lesson-progress-repository'

export class PrismaCourseLessonProgressRepository implements CourseLessonProgressRepository {
  constructor(private prisma: PrismaClient) {}

  async markComplete(userId: string, lessonId: string): Promise<CourseLessonProgress> {
    const record = await this.prisma.courseLessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completedAt: new Date() },
      create: { userId, lessonId },
    })
    return new CourseLessonProgress(record as unknown as CourseLessonProgressData)
  }

  async getCourseProgress(userId: string, courseId: string): Promise<CourseProgressSummary> {
    const [lessons, completed] = await Promise.all([
      this.prisma.courseLesson.findMany({
        where: { courseId },
        orderBy: { order: 'asc' },
        select: { id: true, title: true, order: true },
      }),
      this.prisma.courseLessonProgress.findMany({
        where: { userId, lesson: { courseId } },
        select: { lessonId: true, completedAt: true },
      }),
    ])

    const completedMap = new Map(completed.map((c) => [c.lessonId, c.completedAt]))

    return {
      courseId,
      totalLessons: lessons.length,
      completedLessons: completed.length,
      completionPercent:
        lessons.length > 0 ? Math.round((completed.length / lessons.length) * 100) : 0,
      lessons: lessons.map((l) => ({
        lessonId: l.id,
        title: l.title,
        order: l.order,
        completed: completedMap.has(l.id),
        completedAt: completedMap.get(l.id) ?? undefined,
      })),
    }
  }

  async listCompletedByUser(userId: string): Promise<CourseLessonProgress[]> {
    const records = await this.prisma.courseLessonProgress.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
    })
    return records.map((r) => new CourseLessonProgress(r as unknown as CourseLessonProgressData))
  }

  async listProgressForCourse(courseId: string): Promise<Array<{ userId: string; lessonId: string; completedAt: Date | null }>> {
    return this.prisma.courseLessonProgress.findMany({
      where: { lesson: { courseId } },
      select: { userId: true, lessonId: true, completedAt: true },
    })
  }
}
